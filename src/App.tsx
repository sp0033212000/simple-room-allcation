import React, { ChangeEventHandler, useCallback, useState } from "react";
import CustomInputNumber from "./component/common/field/CustomInputNumber";

const App = () => {
  const [value, setValue] = useState<number>(0);

  const onChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (event) => {
      setValue(Number(event.target.value));
    },
    [],
  );

  return (
    <div className={"w-full h-screen bg-black"}>
      <CustomInputNumber value={value} onChange={onChange} min={-1234} />
    </div>
  );
};

export default App;
