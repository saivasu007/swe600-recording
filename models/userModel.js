var express = require('express');
var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    email: String,
    password: String,
    firstName: String,
    lastName: String,
    address1: String,
    address2: String,
    city: String,
    state: String,
    zipcode: String,
    role: String,
    activeIn: String,
    expiryDate: String,
    subscriber: String,
    birthDate: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    authType: String
});

userSchema.methods.validPassword = function( pwd ) {
    return ( this.password === pwd );
};

module.exports = mongoose.model('userModel', userSchema);