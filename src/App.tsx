import React, {
  ChangeEventHandler,
  FocusEventHandler,
  useCallback,
  useState,
} from "react";
import CustomInputNumber from "./component/common/field/CustomInputNumber";

const App = () => {
  const [value, setValue] = useState<number>(0);

  const onChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (event) => {
      setValue(Number(event.target.value));
    },
    [],
  );

  const onBlur = useCallback<FocusEventHandler<HTMLInputElement>>((event) => {
    const name = event.target.name;
    const value = event.target.value;
    console.log({ name, value });
  }, []);

  return (
    <div className={"w-full h-screen bg-black"}>
      <CustomInputNumber
        name={"test"}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
      />
    </div>
  );
};

export default App;
