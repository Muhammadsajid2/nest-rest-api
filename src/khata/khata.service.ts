import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { CreateKhataDto, CreateKhataTransactionDto, UpdateKhataTransactionDto } from './dto';
import { Khata, KhataDocument } from './schemas/khata.schema';
import { KhataActivity, KhataActivityDocument } from './schemas/khata-activity.schema';
import { KhataTransaction, KhataTransactionDocument } from './schemas/khata-transaction.schema';

type CurrentUser = { _id?: Types.ObjectId; id?: string; name?: string; email?: string };

@Injectable()
export class KhataService {
  constructor(
    @InjectModel(Khata.name) private readonly khataModel: Model<KhataDocument>,
    @InjectModel(KhataTransaction.name) private readonly transactionModel: Model<KhataTransactionDocument>,
    @InjectModel(KhataActivity.name) private readonly activityModel: Model<KhataActivityDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  private userId(user: CurrentUser) {
    return (user._id || user.id).toString();
  }

  private async getAccessibleKhata(id: string, user: CurrentUser) {
    const khata = await this.khataModel.findById(id);
    if (!khata) throw new NotFoundException('Khata not found');
    const isParticipant = khata.participants.some(
      (participant) => participant.userId.toString() === this.userId(user),
    );
    if (!isParticipant) throw new NotFoundException('Khata not found or you do not have access');
    return khata;
  }

  private ensureParticipant(khata: KhataDocument, userId: string) {
    const isParticipant = khata.participants.some((participant) => participant.userId.toString() === userId);
    if (!isParticipant) throw new BadRequestException('Transaction users must be Khata participants');
  }

  private async log(
    khataId: Types.ObjectId | string,
    performedBy: string,
    action: string,
    transactionId?: Types.ObjectId | string,
    previousValues?: unknown,
    newValues?: unknown,
  ) {
    await this.activityModel.create({ khataId, transactionId, action, performedBy, previousValues, newValues });
  }

  async findParticipantOptions(user: CurrentUser, search = '') {
    const currentUserId = this.userId(user);
    const filter: Record<string, unknown> = { _id: { $ne: currentUserId } };
    if (search.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
      ];
    }
    return this.userModel.find(filter).select('_id name email').limit(30).lean();
  }

  async create(dto: CreateKhataDto, user: CurrentUser) {
    const creatorId = this.userId(user);
    if (dto.secondParticipantId === creatorId) throw new BadRequestException('Both Khata participants must be unique');

    const [creator, secondParticipant] = await Promise.all([
      this.userModel.findById(creatorId).select('_id name email').lean(),
      this.userModel.findById(dto.secondParticipantId).select('_id name email').lean(),
    ]);
    if (!creator || !secondParticipant) throw new BadRequestException('Second participant was not found');

    const khata = await this.khataModel.create({
      title: dto.title,
      description: dto.description,
      currency: dto.currency.toUpperCase(),
      createdBy: creatorId,
      participants: [
        { userId: creator._id, name: creator.name, email: creator.email },
        { userId: secondParticipant._id, name: secondParticipant.name, email: secondParticipant.email },
      ],
    });
    await this.log(khata._id, creatorId, 'khata_created', undefined, undefined, { title: khata.title, currency: khata.currency });

    if (dto.openingBalance) {
      const creatorOwes = dto.openingBalanceDirection === 'creatorOwesParticipant';
      const transaction = await this.transactionModel.create({
        khataId: khata._id,
        type: 'adjustment',
        amount: dto.openingBalance,
        // A positive balance means this participant should receive money.
        paidBy: creatorOwes ? secondParticipant._id : creator._id,
        paidTo: creatorOwes ? creator._id : secondParticipant._id,
        description: 'Opening balance',
        transactionDate: new Date(),
        createdBy: creatorId,
      });
      await this.log(khata._id, creatorId, 'adjustment_added', transaction._id, undefined, transaction.toObject());
      await this.refreshStatus(khata);
    }

    return this.getDetail(khata._id.toString(), user);
  }

  async findAll(user: CurrentUser) {
    const currentUserId = this.userId(user);
    const khatas = await this.khataModel.find({ archived: false }).sort({ updatedAt: -1 });
    const accessibleKhatas = khatas.filter((khata) =>
      khata.participants.some((participant) => participant.userId.toString() === currentUserId),
    );
    return Promise.all(accessibleKhatas.map(async (khata) => ({ ...khata.toObject(), summary: await this.calculateSummary(khata) })));
  }

  async getDetail(id: string, user: CurrentUser) {
    const khata = await this.getAccessibleKhata(id, user);
    return { ...khata.toObject(), summary: await this.calculateSummary(khata) };
  }

  async getTransactions(id: string, user: CurrentUser) {
    await this.getAccessibleKhata(id, user);
    return this.transactionModel.find({ khataId: id, archived: false }).sort({ transactionDate: -1, createdAt: -1 }).lean();
  }

  async getActivities(id: string, user: CurrentUser) {
    await this.getAccessibleKhata(id, user);
    return this.activityModel.find({ khataId: id }).sort({ createdAt: -1 }).limit(100).lean();
  }

  private normalizeExpense(khata: KhataDocument, dto: CreateKhataTransactionDto) {
    if (dto.type !== 'expense') return dto;
    if (!dto.splitType) throw new BadRequestException('A split type is required for shared expenses');
    this.ensureParticipant(khata, dto.paidBy);

    const participantIds = khata.participants.map((participant) => participant.userId.toString());
    let splitDetails = dto.splitDetails || [];
    if (dto.splitType === 'equal') {
      if (dto.amount % 2 !== 0) throw new BadRequestException('An equal split must be divisible in the smallest currency unit');
      splitDetails = participantIds.map((participant) => ({ participant, amount: dto.amount / 2 }));
    }
    if (dto.splitType === 'full') {
      if (!dto.expenseFor) throw new BadRequestException('Select the participant responsible for the full expense');
      splitDetails = [{ participant: dto.expenseFor, amount: dto.amount }];
    }
    if (splitDetails.length !== 2 && dto.splitType !== 'full') throw new BadRequestException('Custom splits must include both participants');
    splitDetails.forEach((split) => this.ensureParticipant(khata, split.participant));

    const hasPercentages = splitDetails.some((split) => split.percentage !== undefined);
    if (hasPercentages) {
      if (!splitDetails.every((split) => split.percentage !== undefined)) throw new BadRequestException('Provide a percentage for every split participant');
      const totalPercentage = splitDetails.reduce((sum, split) => sum + Number(split.percentage), 0);
      if (totalPercentage !== 100) throw new BadRequestException('Custom split percentages must equal 100');
      splitDetails = splitDetails.map((split) => ({ ...split, amount: Math.round((dto.amount * Number(split.percentage)) / 100) }));
    }
    const totalAmount = splitDetails.reduce((sum, split) => sum + Number(split.amount || 0), 0);
    if (totalAmount !== dto.amount) throw new BadRequestException('Custom split amounts must equal the transaction amount');
    return { ...dto, splitDetails };
  }

  private validateTransaction(khata: KhataDocument, dto: CreateKhataTransactionDto) {
    this.ensureParticipant(khata, dto.paidBy);
    if (dto.type !== 'expense') {
      if (!dto.paidTo) throw new BadRequestException('Select the participant who received the payment');
      this.ensureParticipant(khata, dto.paidTo);
      if (dto.paidBy === dto.paidTo) throw new BadRequestException('The two transaction participants must be different');
    }
    if (dto.type === 'adjustment' && !dto.description?.trim()) throw new BadRequestException('A reason is required for an adjustment');
  }

  async addTransaction(id: string, dto: CreateKhataTransactionDto, user: CurrentUser) {
    const khata = await this.getAccessibleKhata(id, user);
    if (khata.archived) throw new BadRequestException('Archived Khatas cannot be changed');
    const normalized = this.normalizeExpense(khata, dto);
    this.validateTransaction(khata, normalized);
    const transaction = await this.transactionModel.create({ ...normalized, khataId: khata._id, transactionDate: new Date(normalized.transactionDate), createdBy: this.userId(user) });
    await this.log(khata._id, this.userId(user), normalized.type === 'settlement' ? 'settlement_completed' : normalized.type === 'adjustment' ? 'adjustment_added' : 'transaction_added', transaction._id, undefined, transaction.toObject());
    await this.refreshStatus(khata);
    return transaction;
  }

  async updateTransaction(id: string, transactionId: string, dto: UpdateKhataTransactionDto, user: CurrentUser) {
    const khata = await this.getAccessibleKhata(id, user);
    const transaction = await this.transactionModel.findOne({ _id: transactionId, khataId: id, archived: false });
    if (!transaction) throw new NotFoundException('Transaction not found');
    if (transaction.createdBy.toString() !== this.userId(user)) throw new ForbiddenException('You can only edit your own transactions');
    const merged = { ...transaction.toObject(), ...dto } as CreateKhataTransactionDto;
    const normalized = this.normalizeExpense(khata, merged);
    this.validateTransaction(khata, normalized);
    const previousValues = transaction.toObject();
    Object.assign(transaction, normalized, { transactionDate: new Date(normalized.transactionDate), updatedBy: this.userId(user) });
    await transaction.save();
    await this.log(khata._id, this.userId(user), 'transaction_updated', transaction._id, previousValues, transaction.toObject());
    await this.refreshStatus(khata);
    return transaction;
  }

  async archiveTransaction(id: string, transactionId: string, user: CurrentUser) {
    const khata = await this.getAccessibleKhata(id, user);
    const transaction = await this.transactionModel.findOne({ _id: transactionId, khataId: id, archived: false });
    if (!transaction) throw new NotFoundException('Transaction not found');
    if (transaction.createdBy.toString() !== this.userId(user)) throw new ForbiddenException('You can only archive your own transactions');
    const previousValues = transaction.toObject();
    transaction.archived = true;
    transaction.updatedBy = new Types.ObjectId(this.userId(user));
    await transaction.save();
    await this.log(khata._id, this.userId(user), 'transaction_archived', transaction._id, previousValues, { archived: true });
    await this.refreshStatus(khata);
    return { success: true };
  }

  async archiveKhata(id: string, user: CurrentUser) {
    const khata = await this.getAccessibleKhata(id, user);
    if (khata.createdBy.toString() !== this.userId(user)) throw new ForbiddenException('Only the creator can archive this Khata');
    khata.archived = true;
    khata.status = 'archived';
    await khata.save();
    await this.log(khata._id, this.userId(user), 'khata_archived');
    return { success: true };
  }

  private async refreshStatus(khata: KhataDocument) {
    if (khata.archived) return;
    const summary = await this.calculateSummary(khata);
    const status = summary.outstandingBalance === 0 ? 'settled' : 'active';
    const changed = khata.status !== status;
    khata.status = status;
    await khata.save();
    if (changed && status === 'active') await this.log(khata._id, khata.createdBy.toString(), 'khata_reopened');
  }

  private async calculateSummary(khata: KhataDocument) {
    const transactions = await this.transactionModel.find({ khataId: khata._id, archived: false }).lean();
    const [first, second] = khata.participants;
    const balances: Record<string, number> = { [first.userId.toString()]: 0, [second.userId.toString()]: 0 };
    const totals: Record<string, { paid: number; received: number }> = {
      [first.userId.toString()]: { paid: 0, received: 0 },
      [second.userId.toString()]: { paid: 0, received: 0 },
    };
    let totalSharedExpenses = 0;
    let totalSettlements = 0;

    for (const transaction of transactions) {
      const paidBy = transaction.paidBy.toString();
      totals[paidBy].paid += transaction.amount;
      if (transaction.type === 'expense') {
        totalSharedExpenses += transaction.amount;
        balances[paidBy] += transaction.amount;
        (transaction.splitDetails || []).forEach((split) => { balances[split.participant.toString()] -= Number(split.amount || 0); });
      } else {
        const paidTo = transaction.paidTo?.toString();
        balances[paidBy] += transaction.amount;
        balances[paidTo] -= transaction.amount;
        totals[paidTo].received += transaction.amount;
        if (transaction.type === 'settlement') totalSettlements += transaction.amount;
      }
    }

    const firstBalance = balances[first.userId.toString()];
    const receiver = firstBalance > 0 ? first : firstBalance < 0 ? second : null;
    const owing = firstBalance > 0 ? second : firstBalance < 0 ? first : null;
    return {
      outstandingBalance: Math.abs(firstBalance),
      receiver: receiver ? { userId: receiver.userId, name: receiver.name } : null,
      owing: owing ? { userId: owing.userId, name: owing.name } : null,
      totalSharedExpenses,
      totalSettlements,
      participantTotals: khata.participants.map((participant) => ({
        userId: participant.userId,
        name: participant.name,
        paid: totals[participant.userId.toString()].paid,
        received: totals[participant.userId.toString()].received,
        balance: balances[participant.userId.toString()],
      })),
    };
  }
}
