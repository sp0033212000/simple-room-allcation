import React, {
  ChangeEventHandler,
  FocusEventHandler,
  useCallback,
  useEffect,
  useRef,
} from "react";
import classNames from "classnames";

interface Props {
  min?: number;
  max?: number;
  step?: number;
  name?: string;
  value: number;
  disabled?: boolean;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  allowMinus?: boolean;
}

const CustomInputNumber: React.FC<Props> = ({
  min = 0,
  max = Number.MAX_VALUE,
  step = 1,
  name = "",
  value,
  disabled = false,
  onChange,
  onBlur,
  allowMinus = false,
}) => {
  const [mouseStillIn, setMouseStillIn] = React.useState<boolean>(false);

  const rectClass = useRef(
    "flex items-center justify-center mr-2 last:mr-0 px-2 w-12 h-12 font-base border rounded",
  );
  const buttonActiveClass = useRef(
    "active:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-600",
  );

  const inputRef = useRef<HTMLInputElement>(null);

  const mouseDownTimeout = useRef<NodeJS.Timeout | null>(null);
  const mouseDownInterval = useRef<NodeJS.Timeout | null>(null);

  const inputFocusHandler = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    // Throw error if min > max
    if (min > max) {
      throw new Error("min must be less than or equal to max");
    }
    // Throw error if step > max - min, and max and min is not equal
    if (step > max - min && max !== min) {
      throw new Error("step must be less than or equal to max - min");
    }
    // Throw error if step <= 0
    if (step <= 0) {
      throw new Error("step must be greater than 0");
    }
    // Throw error if min < 0 and allowMinus is false
    if (min < 0 && !allowMinus) {
      throw new Error(
        "Your min is less than 0, but allowMinus is false, please set allowMinus to true or set min to greater than or equal to 0",
      );
    }
  }, [min, max, step, allowMinus]);

  useEffect(() => {
    if (disabled) {
      // Remove all timer
      onMouseUp();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled]);

  const blurHandler = useCallback<FocusEventHandler<HTMLInputElement>>(
    (event) => {
      // If mouse still in, do nothing
      // Else, trigger onBlur
      if (!mouseStillIn) {
        onBlur?.(event);
      }
    },
    [mouseStillIn, onBlur],
  );

  const changeHandler = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (event) => {
      // Focus input when value change
      inputFocusHandler();

      if (disabled) {
        return;
      }
      const value = event.target.value;

      // If value start with minus sign, or end with minus sign, isMinus is true
      const isMinus = (/^-/.test(value) || /-$/.test(value)) && value !== "-";
      let parsedValue = Number(value.replace(/[^0-9]/g, ""));

      if (isMinus && allowMinus) {
        if (parsedValue === 0) {
          parsedValue = -1;
        } else {
          parsedValue = -parsedValue;
        }
      }

      if (parsedValue < min) {
        event.target.value = `${min}`;
      } else if (parsedValue > max) {
        event.target.value = `${max}`;
      } else {
        event.target.value = `${parsedValue}`;
      }

      onChange?.(event);
    },
    [min, max, allowMinus, inputFocusHandler, disabled, onChange],
  );

  const nativeInputEventValueSetter = useCallback((value: string) => {
    const input = inputRef.current;
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value",
    )?.set;
    nativeInputValueSetter?.call(input, `${value}`);
    const ev2 = new Event("input", { bubbles: true });
    input?.dispatchEvent(ev2);
  }, []);

  const riser = useCallback(() => {
    const currentValue = Number(inputRef.current?.value);
    const nextValue = currentValue + step;
    if (nextValue > max) {
      nativeInputEventValueSetter(`${max}`);
    } else {
      nativeInputEventValueSetter(`${nextValue}`);
    }
  }, [step, max, nativeInputEventValueSetter]);
  const dropper = useCallback(() => {
    const currentValue = Number(inputRef.current?.value);
    const nextValue = currentValue - step;
    if (nextValue < min) {
      nativeInputEventValueSetter(`${min}`);
    } else {
      nativeInputEventValueSetter(`${nextValue}`);
    }
  }, [step, min, nativeInputEventValueSetter]);

  const onPlusMouseDown = useCallback(() => {
    // Wait 500ms before starting to increment the value
    mouseDownTimeout.current = setTimeout(() => {
      mouseDownInterval.current = setInterval(riser, 100);
    }, 500);
  }, [riser]);

  const onMinusMouseDown = useCallback(() => {
    // Wait 500ms before starting to increment the value
    mouseDownTimeout.current = setTimeout(() => {
      mouseDownInterval.current = setInterval(dropper, 100);
    }, 500);
  }, [dropper]);

  const onMouseUp = useCallback(() => {
    if (mouseDownInterval.current) {
      clearInterval(mouseDownInterval.current);
      mouseDownInterval.current = null;
    }
    if (mouseDownTimeout.current) {
      clearTimeout(mouseDownTimeout.current);
      mouseDownTimeout.current = null;
    }
  }, []);

  const onMouseLeave = useCallback(() => {
    setMouseStillIn(false);
    onMouseUp();
  }, [onMouseUp]);

  const onMouseEnter = useCallback(() => {
    setMouseStillIn(true);
  }, []);

  return (
    <div
      className={
        "relative flex p-2 w-fit text-white border rounded-md overflow-hidden"
      }
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        className={classNames(
          "absolute top-0 left-0 z-10",
          "w-full h-full",
          "bg-gray-600 bg-opacity-75",
          "cursor-not-allowed",
          {
            "hidden invisible": !disabled,
          },
        )}
      />
      <button
        type={"button"}
        className={classNames(rectClass.current, buttonActiveClass.current)}
        onClick={riser}
        onMouseDown={onPlusMouseDown}
        onMouseUp={onMouseUp}
        disabled={disabled || value >= max}
      >
        +
      </button>
      <div
        className={classNames(rectClass.current)}
        onClick={inputFocusHandler}
      >
        <input
          ref={inputRef}
          className={"w-full text-center bg-transparent"}
          onChange={changeHandler}
          value={`${value}`}
          name={name}
          onBlur={blurHandler}
          disabled={disabled}
        />
      </div>
      <button
        type={"button"}
        className={classNames(rectClass.current, buttonActiveClass.current)}
        onClick={dropper}
        onMouseDown={onMinusMouseDown}
        onMouseUp={onMouseUp}
        disabled={disabled || value <= min}
      >
        -
      </button>
    </div>
  );
};

export default CustomInputNumber;
