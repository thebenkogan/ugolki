import {
  DocumentReference,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import React, { useEffect } from "react";
import { playMove } from "../game/game";
import { flipMove, movesFromCoordinate } from "../game/moves";
import { Coordinates, Game, Move } from "../types";
import Square from "./Square";

interface BoardProps {
  game: Game;
  setGame: (game: Game) => void;
  pastMoves: Move[];
  isTurn: boolean;
  setIsTurn: (isTurn: boolean) => void;
  docRef: DocumentReference;
}

function Board({
  game,
  setGame,
  pastMoves,
  isTurn,
  setIsTurn,
  docRef,
}: BoardProps): JSX.Element {
  const [highlighted, setHighlighted] = React.useState<Coordinates[]>([]);
  const [selected, setSelected] = React.useState<Coordinates | null>(null);

  useEffect(() => {
    setHighlighted([]);
    setSelected(null);
  }, [game]);

  const handleClick = async ([cx, cy]: Coordinates, isMove: boolean) => {
    if (isMove && isTurn) {
      const move: Move = { start: selected!, end: [cx, cy] };
      setGame(playMove(game, move));
      setSelected(null);
      setHighlighted([]);
      setIsTurn(false);
      await updateDoc(docRef!, {
        moves: JSON.stringify([
          ...pastMoves,
          game.color === "White" ? move : flipMove(move),
        ]),
        turn: game.color === "White" ? "Black" : "White",
        timestamp: serverTimestamp(),
      });
    } else {
      setHighlighted(
        game.board[cy][cx] === game.color
          ? movesFromCoordinate(game.moves, [cx, cy]).map((move) => move.end)
          : []
      );
      setSelected([cx, cy]);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen w-screen">
      <div className="grid grid-cols-8 grid-rows-8 w-screen sm:max-w-xl mx-5 border-4 border-black">
        {game.board.flatMap((row, y) =>
          row.map((player, x) => {
            return (
              <Square
                key={x * 10 + y}
                coord={[x, y]}
                tileColor={(x + y) % 2 == 0 ? "dark" : "light"}
                highlighted={highlighted.some(
                  ([hx, hy]) => hx === x && hy === y
                )}
                handleClick={handleClick}
                player={player ? player : undefined}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

export default Board;
