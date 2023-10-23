import React, { useState } from "react";
import RoomAllocation, {
  RoomAllocationResult,
} from "./component/feature/RoomAllocation";

const App = () => {
  const [value, setValue] = useState<Array<RoomAllocationResult>>([]);

  return (
    <div className={"flex min-w-full min-h-screen bg-black"}>
      <div className={"flex-1 max-w-[50vw]"}>
        <RoomAllocation guest={10} room={3} onChange={setValue} />
      </div>
      <div className={"p-6 flex-2 text-white whitespace-pre-wrap"}>
        {JSON.stringify({ result: value }, null, 4)}
      </div>
    </div>
  );
};

export default App;
