import React, {
  ChangeEventHandler,
  FocusEventHandler,
  useCallback,
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
  const rectClass = useRef(
    "flex items-center justify-center mr-2 last:mr-0 px-2 w-12 h-12 font-base border rounded",
  );
  const buttonActiveClass = useRef("active:bg-gray-700");

  const inputRef = useRef<HTMLInputElement>(null);

  const mouseDownTimeout = useRef<NodeJS.Timeout | null>(null);
  const mouseDownInterval = useRef<NodeJS.Timeout | null>(null);

  const divClickHandler = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const changeHandler = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (event) => {
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
    [min, max, allowMinus],
  );

  const nativeInputEventValueSetter = useCallback(
    (value: string) => {
      const input = inputRef.current;
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value",
      )?.set;
      nativeInputValueSetter?.call(input, `${value}`);
      const ev2 = new Event("input", { bubbles: true });
      input?.dispatchEvent(ev2);
    },
    [step],
  );

  const riser = useCallback(() => {
    const currentValue = Number(inputRef.current?.value);
    const nextValue = currentValue + step;
    if (nextValue > max) {
      nativeInputEventValueSetter(`${max}`);
    } else {
      nativeInputEventValueSetter(`${nextValue}`);
    }
  }, [step, max]);
  const dropper = useCallback(() => {
    const currentValue = Number(inputRef.current?.value);
    const nextValue = currentValue - step;
    if (nextValue < min) {
      nativeInputEventValueSetter(`${min}`);
    } else {
      nativeInputEventValueSetter(`${nextValue}`);
    }
  }, [step, min]);

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

  return (
    <div
      className={
        "relative flex p-2 w-fit text-white border rounded-md overflow-hidden"
      }
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
      >
        +
      </button>
      <div className={classNames(rectClass.current)} onClick={divClickHandler}>
        <input
          ref={inputRef}
          className={"w-full text-center bg-transparent"}
          onChange={changeHandler}
          value={`${value}`}
          name={name}
          onBlur={onBlur}
        />
      </div>
      <button
        type={"button"}
        className={classNames(rectClass.current, buttonActiveClass.current)}
        onClick={dropper}
        onMouseDown={onMinusMouseDown}
        onMouseUp={onMouseUp}
      >
        -
      </button>
    </div>
  );
};

export default CustomInputNumber;
