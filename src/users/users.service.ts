import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  private users = [
    {
      id: 1,
      name: 'John Doe',
      age: 30,
      role: 'ADMIN',
      email: 'john.doe@example.com',
    },
    {
      id: 2,
      name: 'Jane Smith',
      age: 25,
      role: 'INTERN',
      email: 'jane.smith@example.com',
    },
    {
      id: 3,
      name: 'Sam Wilson',
      age: 28,
      role: 'ADMIN',
      email: 'sam.wilson@example.com',
    },
    {
      id: 4,
      name: 'Emily Davis',
      age: 22,
      role: 'INTERN',
      email: 'emily.davis@example.com',
    },
  ];

  // Method to find all users or filter by role
  findAll(role?: 'ADMIN' | 'INTERN') {
    if (role) {
      const normalizedRole = role.toUpperCase();
      return this.users.filter((user) => user.role === normalizedRole);
    }
    return this.users;
  }

  // Method to find all interns
  findAllInterns() {
    return this.users.filter((user) => user.role === 'INTERN');
  }

  // Method to find a single user by ID
  findOne(id: number) {
    return this.users.find((user) => user.id === id) || null;
  }

  // Method to create a new user
  create(user: {
    name: string;
    age: number;
    role: 'ADMIN' | 'INTERN';
    email: string;
  }) {
    const newUser = {
      id: this.users.length + 1,
      ...user,
      role: user.role.toUpperCase(),
    };
    this.users.push(newUser);
    return newUser;
  }

  // Method to update an existing user by ID
  updateUser(
    id: number,
    updatedUser: Partial<{
      name: string;
      age: number;
      role: 'ADMIN' | 'INTERN';
      email: string;
    }>,
  ) {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex === -1) {
      return null; // User not found
    }

    const updatedUserData = {
      ...this.users[userIndex],
      ...updatedUser,
      role: updatedUser.role
        ? updatedUser.role.toUpperCase()
        : this.users[userIndex].role,
    };
    this.users[userIndex] = updatedUserData;
    return updatedUserData;
  }

  deleteUser(id: number) {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex === -1) {
      return null; // User not found
    }
    this.users.splice(userIndex, 1); // Remove the user
    return this.findAll(); // Return the updated list of users
  }
}
