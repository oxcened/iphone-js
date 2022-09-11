import { isNumberKey, isOperationKey, Key, NumberKey, OperationKey, OtherKey } from '../Keyboard/Key';
import { useState } from 'react';

export const useCalculator = () => {
  const [firstNum, setFirstNum] = useState(0);
  const [secondNum, setSecondNum] = useState<number>();
  const [operation, setOperation] = useState<OperationKey>();
  const [trailingComma, setTrailingComma] = useState(false);
  const [isOverrideFirstNum, setOverrideFirstNum] = useState(false);
  const [isOverrideSecondNum, setOverrideSecondNum] = useState(false);

  const secondNumExists = secondNum !== undefined;
  const currentNum = secondNumExists ? secondNum : firstNum;
  const currentNumAtMaxLength = currentNum.toString().replace('.', '').length > 8;
  const shouldBlockNewInput = currentNumAtMaxLength && !isOverrideFirstNum && !isOverrideSecondNum;
  const displayedText = secondNumExists ? secondNum : firstNum;
  const activeOperation = isOverrideSecondNum ? operation : undefined;
  const isClearCurrentNumber = getIsClearCurrentNumber(firstNum, isOverrideFirstNum, isOverrideSecondNum, trailingComma, secondNum);

  const onKeyPress = (key: Key) => {
    if (isNumberKey(key)) {
      onNumberPress(key);
    } else if (isOperationKey(key)) {
      onOperationPress(key);
    } else {
      onOtherKeyPress(key);
    }
  };

  const onNumberPress = (key: NumberKey) => {
    if (shouldBlockNewInput) return;

    if (isOverrideFirstNum) {
      setFirstNum(getOverriddenNumber(key));
      setOverrideFirstNum(false);
    } else if (!operation) {
      setFirstNum(prevNum => getAppendedNumber(prevNum, key, trailingComma));
    } else if (isOverrideSecondNum) {
      setSecondNum(getOverriddenNumber(key));
      setOverrideSecondNum(false);
    } else {
      setSecondNum(prevNum => getAppendedNumber(prevNum, key, trailingComma));
    }

    if (trailingComma) {
      setTrailingComma(false);
    }
  };

  const onOperationPress = (key: OperationKey) => {
    const isPrevOperationPending = operation && secondNumExists && !isOverrideSecondNum;

    if (isPrevOperationPending) {
      setSecondNum(calculateOperation(operation, false));
    } else {
      setSecondNum(firstNum);
    }

    setOperation(key);
    setOverrideSecondNum(true);
    setOverrideFirstNum(false);
  };

  const calculateOperation = (operation: OperationKey, clearSecondNum = true) => {
    if (!secondNumExists) return;

    const result = getOperationResult(firstNum, secondNum, operation);
    setFirstNum(result);
    setOperation(undefined);
    setTrailingComma(false);
    setOverrideFirstNum(true);

    if (clearSecondNum) {
      setSecondNum(undefined);
    }

    return result;
  };

  const onOtherKeyPress = (key: OtherKey) => {
    switch (key) {
      case 'equals': {
        if (operation && secondNumExists) {
          calculateOperation(operation);
        }
        break;
      }
      case 'percentage':
        // TODO handle this button press
        break;
      case 'negative':
        // TODO handle this button press
        break;
      case 'delete':
        onDeletePress();
        break;
      case 'comma':
        onCommaPress();
        break;
    }
  };

  const onDeletePress = () => {
    const shouldReenterSecondNum = operation && (!isOverrideSecondNum || secondNum);

    if (shouldReenterSecondNum) {
      setSecondNum(0);
      setOverrideSecondNum(true);
    } else {
      setFirstNum(0);
      setSecondNum(undefined);
      setOperation(undefined);
      setOverrideSecondNum(false);
      setOverrideFirstNum(false);
    }

    setTrailingComma(false);
  };

  const onCommaPress = () => {
    if (shouldBlockNewInput) return;

    const currentNumIsDecimal = currentNum.toString().includes('.');

    if (isOverrideFirstNum || isOverrideSecondNum || !currentNumIsDecimal) {
      setTrailingComma(true);
    }

    if (isOverrideSecondNum) {
      setSecondNum(0);
      setOverrideSecondNum(false);
    }

    if (isOverrideFirstNum) {
      setFirstNum(0);
      setOverrideFirstNum(false);
    }
  };

  return {
    trailingComma,
    isOverrideFirstNum,
    isOverrideSecondNum,
    secondNumExists,
    displayedText,
    activeOperation,
    isClearCurrentNumber,
    onKeyPress
  };
};

const getOperationResult = (firstNum: number, secondNum: number, operation: OperationKey) => {
  switch (operation) {
    case 'addition':
      return firstNum + secondNum;
    case 'subtraction':
      return firstNum - secondNum;
    case 'division':
      return firstNum / secondNum;
    case 'multiplication':
      return firstNum * secondNum;
  }
};

const getAppendedNumber = (prevNumber = 0, newDigit: NumberKey, trailingComma: boolean) => {
  return parseFloat(`${prevNumber}${trailingComma ? '.' : ''}${newDigit}`)
};

const getOverriddenNumber = (newDigit: NumberKey) => {
  return parseFloat(newDigit);
};

const getIsClearCurrentNumber = (
  firstNum: number,
  isOverrideFirstNum: boolean,
  isOverrideSecondNum: boolean,
  trailingComma: boolean,
  secondNum?: number
) => {
  if (!secondNum && isOverrideSecondNum) {
    return false;
  }

  if (!firstNum && isOverrideFirstNum) {
    return true;
  }

  return !!firstNum || !!secondNum || trailingComma;
};