var express = require('express');
var mongoose = require('mongoose');

var userMediaSchema = new mongoose.Schema({
    email: String,
    media: Buffer,
    contentType: String,
    tempURL: String
});

module.exports = mongoose.model('userMediaModel', userMediaSchema);