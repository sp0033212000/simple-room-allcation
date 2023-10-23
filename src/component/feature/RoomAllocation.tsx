import React, {
  ChangeEventHandler,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { v4 as uuidv4 } from "uuid";
import CustomInputNumber from "../common/field/CustomInputNumber";

export interface RoomAllocationResult {
  adult: number;
  child: number;
}

interface SerializedRoomAllocation extends RoomAllocationResult {
  id: string;
}

interface Props {
  guest: number;
  room: number;
  onChange: (result: Array<RoomAllocationResult>) => void;
}

const RoomAllocation: React.FC<Props> = ({ guest, room, onChange }) => {
  const [serializedRoom, setSerializedRoom] = useState<
    Array<SerializedRoomAllocation>
  >(() =>
    Array(room)
      .fill(0)
      .map(() => ({
        adult: 1,
        child: 0,
        id: uuidv4(),
      })),
  );

  useEffect(() => {
    onChange(serializedRoom.map(({ adult, child }) => ({ adult, child })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serializedRoom]);

  const totalAssignedGuest = useMemo(() => {
    return serializedRoom.reduce(
      (acc, curr) => acc + curr.adult + curr.child,
      0,
    );
  }, [serializedRoom]);

  const handleAdultChange = useCallback((id: string) => {
    return (adult: number) => {
      setSerializedRoom((prev) =>
        prev.map((room) => {
          if (room.id === id) {
            return { ...room, adult };
          }
          return room;
        }),
      );
    };
  }, []);

  const handleChildChange = useCallback((id: string) => {
    return (child: number) => {
      setSerializedRoom((prev) =>
        prev.map((room) => {
          if (room.id === id) {
            return { ...room, child };
          }
          return room;
        }),
      );
    };
  }, []);

  return (
    <div className={"p-6 text-white border border-dashed rounded-xl"}>
      <p className={"mb-4"}>
        住客人數：<strong>{guest}</strong>人 / <strong>{room}</strong>房
      </p>
      <p className={"mb-4 p-2 bg-blue-200 text-gray-400 rounded"}>
        尚未分配人數：<strong>{guest - totalAssignedGuest}</strong>人
      </p>
      <div className={"divide-y divide-gray-300"}>
        {serializedRoom.map((room) => (
          <SingleRoomAllocation
            key={room.id}
            id={room.id}
            adult={room.adult}
            child={room.child}
            onAdultChange={handleAdultChange(room.id)}
            onChildChange={handleChildChange(room.id)}
            leftGuest={guest - totalAssignedGuest}
          />
        ))}
      </div>
    </div>
  );
};

export default RoomAllocation;

const SingleRoomAllocation = memo<{
  id: string;
  adult: number;
  child: number;
  onAdultChange: (adult: number) => void;
  onChildChange: (child: number) => void;
  leftGuest: number;
}>(
  ({ id, adult, child, onAdultChange, onChildChange, leftGuest }) => {
    const changeHandler = useCallback<
      (type: "adult" | "child") => ChangeEventHandler<HTMLInputElement>
    >(
      (type) => {
        return (event) => {
          const value = parseInt(event.target.value, 10);
          if (isNaN(value)) {
            return;
          } else if (value < 0) {
            return;
          } else {
            if (type === "adult") {
              onAdultChange(value);
            } else if (type === "child") {
              onChildChange(value);
            } else {
              throw new Error("Invalid type");
            }
          }
        };
      },
      [onAdultChange, onChildChange],
    );

    return (
      <div className={"mt-4 pt-2 first:mt-0"}>
        <p className={"mb-2 text-xl font-bold"}>房間：{adult + child}人</p>
        <div className={"mb-2 flex"}>
          <p className={"w-40"}>
            成人 <span className={"text-gray-400"}>(年齡18+)</span>：
          </p>
          <div className={"flex-1"}>
            <CustomInputNumber
              name={`${id}-adult`}
              value={adult}
              min={1}
              max={Math.max(leftGuest + adult, adult)}
              onChange={changeHandler("adult")}
            />
          </div>
        </div>
        <div className={"flex"}>
          <p className={"w-40"}>小孩：</p>
          <div className={"flex-1"}>
            <CustomInputNumber
              name={`${id}-child`}
              value={child}
              max={Math.max(leftGuest + child, child)}
              onChange={changeHandler("child")}
            />
          </div>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) =>
    prevProps.adult === nextProps.adult &&
    prevProps.child === nextProps.child &&
    prevProps.leftGuest === nextProps.leftGuest,
);
