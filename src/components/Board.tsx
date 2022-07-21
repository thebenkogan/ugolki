import {
  DocumentReference,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import React from "react";
import { isGameOver, playMove } from "../game/game";
import {
  flipMove,
  moveContainsCoordinate,
  movesFromCoordinate,
} from "../game/moves";
import { Coordinates, Game, Move, Player } from "../types";
import Square from "./Square";

interface BoardProps {
  game: Game;
  setGame: (game: Game) => void;
  pastMoves: Move[];
  isTurn: boolean;
  setIsTurn: (isTurn: boolean) => void;
  docRef: DocumentReference;
  setWinner: (winner: Player | null) => void;
}

function Board({
  game,
  setGame,
  pastMoves,
  isTurn,
  setIsTurn,
  docRef,
  setWinner,
}: BoardProps): JSX.Element {
  const [highlighted, setHighlighted] = React.useState<
    [Coordinates, Coordinates[] | undefined][]
  >([]);
  const [selected, setSelected] = React.useState<Coordinates | null>(null);
  const lastMove = pastMoves[pastMoves.length - 1];

  const handleClick = async (
    [cx, cy]: Coordinates,
    isMove: boolean,
    path?: Coordinates[]
  ) => {
    if (isTurn) {
      if (isMove) {
        const move: Move = { start: selected!, end: [cx, cy], path };
        const newGame = playMove(game, move);
        const winner = isGameOver(newGame);
        setGame(newGame);
        setSelected(null);
        setHighlighted([]);
        setIsTurn(false);
        setWinner(winner);
        await updateDoc(docRef!, {
          moves: JSON.stringify([
            ...pastMoves,
            game.color === "White" ? move : flipMove(move),
          ]),
          turn: game.color === "White" ? "Black" : "White",
          winner: winner,
          timestamp: serverTimestamp(),
        });
      } else {
        setHighlighted(
          game.board[cy][cx] === game.color
            ? movesFromCoordinate(game.moves, [cx, cy]).map((move) => [
                move.end,
                move.path,
              ])
            : []
        );
        setSelected([cx, cy]);
      }
    }
  };

  const border = isTurn ? "border-teal-500" : "border-black";
  return (
    <div className="flex justify-center items-center max-h-fit w-screen">
      <div
        className={`tall-board sm:screen-board border-4 sm:border-8 ${border}`}
      >
        {game.board.flatMap((row, y) =>
          row.map((player, x) => {
            const highlight = highlighted.find(
              ([[hx, hy], _]) => hx === x && hy === y
            );
            const isLastMoveSquare =
              isTurn &&
              !!lastMove &&
              moveContainsCoordinate(
                game.color === "White" ? lastMove : flipMove(lastMove),
                [x, y]
              );
            return (
              <Square
                key={x * 10 + y}
                coord={[x, y]}
                path={highlight?.[1]} // path to square from selected, if in such a state
                tileColor={(x + y) % 2 == 0 ? "dark" : "light"}
                highlighted={!!highlight}
                isLastMoveSquare={isLastMoveSquare}
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
