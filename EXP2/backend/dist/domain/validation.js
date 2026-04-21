"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidEvaluationConcept = isValidEvaluationConcept;
exports.validateStudentInput = validateStudentInput;
exports.validateClassGroupInput = validateClassGroupInput;
function isValidEvaluationConcept(value) {
    return value === 'MANA' || value === 'MPA' || value === 'MA';
}
function validateStudentInput(input) {
    const errors = [];
    if (!input.name?.trim()) {
        errors.push('Nome e obrigatorio.');
    }
    if (!input.cpf?.trim()) {
        errors.push('CPF e obrigatorio.');
    }
    if (!input.email?.trim()) {
        errors.push('Email e obrigatorio.');
    }
    return errors;
}
function validateClassGroupInput(input) {
    const errors = [];
    if (!input.topicDescription?.trim()) {
        errors.push('Descricao do topico e obrigatoria.');
    }
    if (typeof input.year !== 'number' || Number.isNaN(input.year)) {
        errors.push('Ano e obrigatorio.');
    }
    if (typeof input.semester !== 'number' || Number.isNaN(input.semester)) {
        errors.push('Semestre e obrigatorio.');
    }
    return errors;
}
