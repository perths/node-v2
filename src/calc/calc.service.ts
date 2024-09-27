import { Injectable } from '@nestjs/common';
import { CalcDto } from './calc.dto';

@Injectable()
export class CalcService {
  calculateExpression(calcBody: CalcDto) {
    try {
      const expression = calcBody?.expression;

      // Check if expression is provided and if it's a string
      if (!expression || typeof expression !== 'string') {
        throw new Error('Expression required');
      }
      // to-do* Check if all characters in expression are valid

      // Check if the expression starts with / or * operator or ends with + - / * operator
      if (
        !checkCharacterType(3, expression[0]) ||
        checkCharacterType(2, expression[expression.length - 1])
      ) {
        throw new Error('Invalid expression provided');
      }

      const result = evalExpression(expression);
      return { result };
    } catch (error) {
      const message = typeof error === 'object' ? error.message : error;
      return {
        statusCode: 400,
        message,
        error: 'Bad Request',
      };
    }
  }
}

const checkPrecedence = (operator: string): number => {
  switch (operator) {
    case '+':
      return 1;
    case '-':
      return 2;
    case '*':
      return 3;
    case '/':
      return 4;
    default:
      throw new Error('Unknown Operator - ' + operator);
  }
};

const operation = (a: number, b: number, operator: string): number => {
  switch (operator) {
    case '-':
      return a - b;
    case '+':
      return a + b;
    case '*':
      return a * b;
    case '/':
      return a / b;
    default:
      throw new Error('Unknown Operator - ' + operator);
  }
};

const performOperation = (numbers: number[], operators: string[]): void => {
  const operator = operators.pop();
  const b = numbers.pop();
  const a = numbers.pop();
  if (operator && b !== undefined && a !== undefined) {
    numbers.push(operation(a, b, operator));
  }
};

const checkCharacterType = (type: number, character: string): boolean => {
  // Check if it's a number or decimal point
  if (type === 1) {
    return /\d|\./.test(character);
  }
  // Check if it's an operator
  else if (type === 2) {
    return /[*\/+\-]/.test(character);
  }
  // check for first character in expression
  else if (type === 3) {
    return /\d|\.|[+\-]/.test(character);
  }
  // check if expression has valid characters
  else if (type === 4) {
    return /^[\d*\/+\-]+$/.test(character);
  }
  return false;
};

const evalExpression = (expression: string): number | null => {
  const numbers: number[] = [];
  const operators: string[] = [];
  let i = 0;
  let character: string;

  // remove any whitespaces in expression
  expression = expression.replace(/\s+/g, '');

  // if first char in expression is + or -
  if (expression[i] === '-' || expression[i] === '+') {
    const sign = expression[i] === '-' ? -1 : 1;
    i++;
    let numString = '';
    while (i < expression.length && checkCharacterType(1, expression[i])) {
      numString += expression[i++];
    }
    numbers.push(sign * parseFloat(numString));
  }

  // iterate through all characters in expression
  for (; i < expression.length; i++) {
    character = expression[i];

    // If the character is a number/decimal
    if (checkCharacterType(1, character)) {
      let numString = '';
      // process all numeric/decimal characters as a single number
      while (i < expression.length && checkCharacterType(1, character)) {
        numString += expression[i];
        character = expression[++i];
      }
      numbers.push(parseFloat(numString));
    }

    // If the character is an operator
    if (checkCharacterType(2, character)) {
      // perform operation if the current operator has higher precedence than the top operator in operator stack
      while (
        operators.length &&
        checkPrecedence(operators[operators.length - 1]) >=
          checkPrecedence(character)
      ) {
        performOperation(numbers, operators);
      }
      operators.push(character);
    }
  }
  // Perform remaining operations
  while (operators.length) {
    performOperation(numbers, operators);
  }

  return numbers.pop() ?? null;
};
