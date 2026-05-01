import { body } from 'express-validator';

export const createCourseValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Título é obrigatório')
    .isLength({ max: 255 }),
  body('slug')
    .trim()
    .notEmpty().withMessage('Slug é obrigatório')
    .matches(/^[a-z0-9-]+$/).withMessage('Slug deve conter apenas letras minúsculas, números e hífens'),
  body('description')
    .trim()
    .notEmpty().withMessage('Descrição é obrigatória'),
  body('instructorId')
    .trim()
    .notEmpty().withMessage('Instrutor é obrigatório'),
  body('categoryId')
    .trim()
    .notEmpty().withMessage('Categoria é obrigatória'),
  body('level')
    .trim()
    .notEmpty().withMessage('Nível é obrigatório')
    .isIn(['Iniciante', 'Intermediario', 'Avancado']).withMessage('Nível inválido'),
];

export const createModuleValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Título é obrigatório'),
  body('courseId')
    .trim()
    .notEmpty().withMessage('Curso é obrigatório'),
];

export const createLessonValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Título é obrigatório'),
  body('moduleId')
    .trim()
    .notEmpty().withMessage('Módulo é obrigatório'),
  body('courseId')
    .trim()
    .notEmpty().withMessage('Curso é obrigatório'),
];
