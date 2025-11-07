require('dotenv').config(); //gets the env variables
const mongoose = require('mongoose');
const { hashPassword } = require('./encryption'); //getting the function to hash passwords.
const Role = require('../models/Role'); //the tables 
const Employee = require('../models/Employee');
const connectDB = require('../config/database'); //connect to MongoDB.

//adds and creates the fields and tables 
const populateDatabase = async () => {
  try {
    console.log(' Starting database seeding...\n');

    // connect to database
    await connectDB();

    // Clear existing data (optional - comment out in production)
    console.log('Clearing existing roles and employees...');
    await Role.deleteMany({});
    await Employee.deleteMany({});
    console.log('Cleared existing data\n');

    // creating the roles
    console.log('Creating roles...');
    
    const customerRole = await Role.create({
      role_name: 'customer',
      permissions: ['create_payment', 'view_own_transactions']
    });
    console.log(` Created role: ${customerRole.role_name}`);

    const employeeRole = await Role.create({
      role_name: 'employee',
      permissions: [
        'verify_transactions',
        'submit_to_swift',
        'view_all_transactions'
      ]
    });
    console.log(` Created role: ${employeeRole.role_name}`);


    // creating pre-registered employee
    console.log('Creating pre-registered employees...');

    // Employee 
    const employee1Password = await hashPassword('Employee123!');
    const employee1 = await Employee.create({
      employee_name: 'Belly Jean',
      username: 'belly.jean',
      employee_id: 'EMP0001',
      password_hash: employee1Password,
      role_id: employeeRole._id,
      is_active: true
    });
    console.log(`Created employee: ${employee1.employee_name} (${employee1.employee_id})`);
    console.log(`   Username: ${employee1.username}, Password: Employee123!`);

   
    console.log('\n Database populating completed successfully!\n');
    console.log(' Summary:');
    console.log(`   - ${await Role.countDocuments()} roles created`);
    console.log(`   - ${await Employee.countDocuments()} employees created`);
    console.log('\nIMPORTANT: Change default passwords in production!\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// executing the functions above 
populateDatabase();