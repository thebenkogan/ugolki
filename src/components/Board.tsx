import { DocumentReference } from "firebase/firestore";
import React from "react";
import { sendMove } from "../firebase/games";
import { updateRivalry } from "../firebase/users";
import { isGameOver, playMove } from "../game/game";
import {
  Coordinates,
  findMove,
  flipMove,
  moveContainsCoordinate,
  movesFromCoordinate,
} from "../game/moves";
import { GameData } from "../pages/games/[code]";
import Square from "./Square";

interface BoardProps {
  gameData: GameData;
  setGameData: React.Dispatch<React.SetStateAction<GameData | undefined>>;
  docRef: DocumentReference;
  userId?: string;
}

function Board({
  gameData,
  setGameData,
  docRef,
  userId,
}: BoardProps): JSX.Element {
  const [highlighted, setHighlighted] = React.useState<
    [Coordinates, Coordinates[] | undefined][]
  >([]);
  const [selected, setSelected] = React.useState<Coordinates | null>(null);
  const lastMove = gameData.pastMoves[gameData.pastMoves.length - 1];

  const handleClick = async ([cx, cy]: Coordinates, isMove: boolean) => {
    if (gameData.isTurn) {
      if (isMove) {
        const move = findMove(gameData.game.moves, selected!, [cx, cy])!;
        const newGame = playMove(gameData.game, move);
        const newPastMoves = [...gameData.pastMoves, move];
        const winner = isGameOver(newGame, newPastMoves);
        const newGameData = {
          ...gameData,
          game: newGame,
          pastMoves: newPastMoves,
          isTurn: false,
          winner,
        };
        setGameData(newGameData);
        setSelected(null);
        setHighlighted([]);
        await sendMove(newGameData, docRef);
        if (winner) {
          updateRivalry(userId!, gameData.oppId!, winner === newGame.color);
        }
      } else {
        setHighlighted(
          gameData.game.board[cy][cx] === gameData.game.color
            ? movesFromCoordinate(gameData.game.moves, [cx, cy]).map((move) => [
                move.end,
                move.path,
              ])
            : []
        );
        setSelected([cx, cy]);
      }
    }
  };

  const border = gameData.isTurn ? "border-teal-500" : "border-black";
  return (
    <div className="flex justify-center items-center max-h-fit w-screen">
      <div className={`board sm:phone-board border-4 sm:border-8 ${border}`}>
        {gameData.game.board.flatMap((row, y) =>
          row.map((player, x) => {
            const squareIsHighlighted = highlighted.some(
              ([[hx, hy], _]) => hx === x && hy === y
            );
            const isLastMoveSquare =
              gameData.isTurn &&
              !!lastMove &&
              moveContainsCoordinate(
                gameData.game.color === "White" ? lastMove : flipMove(lastMove),
                [x, y]
              );
            return (
              <Square
                key={x * 10 + y}
                coord={[x, y]}
                tileColor={(x + y) % 2 == 0 ? "dark" : "light"}
                highlighted={squareIsHighlighted}
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
