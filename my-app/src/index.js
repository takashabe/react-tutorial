import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i, j) {
    let value = this.props.squares[i][j];
    if (this.props.highlightLine) {
      for (let o of this.props.highlightLine) {
        if (o.x === i && o.y === j) {
          value = <mark>{value}</mark>;
        }
      }
    }
    return (
      <Square
        key={i + '_' + j}
        value={value}
        onClick={() => this.props.onClick(i, j)}
      />
    );
  }

  render() {
    let rows = [];
    for (let i = 0; i < 3; i++) {
      let items = [];
      for (let j = 0; j < 3; j++) {
        items.push(this.renderSquare(i, j));
      }
      rows.push(
        <div key={i} className="board-row">
          {items}
        </div>,
      );
    }
    return <div>{rows}</div>;
  }
}

class Game extends React.Component {
  constructor() {
    super();
    this.state = {
      history: [
        {
          squares: [...Array(3)].map(() => Array(3).fill(null)),
        },
      ],
      historyOrder: true,
      stepNumber: 0,
      xIsNext: true,
    };
  }

  getPlayer() {
    if (this.state.xIsNext) {
      return 'X';
    } else {
      return 'O';
    }
  }

  handleClick(i, j) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    let squares = current.squares.slice();
    for (let k in squares) {
      squares[k] = squares[k].slice();
    }

    // already finished game, or already filled squares
    if (calculateResult(squares).winner || squares[i][j]) {
      return;
    }
    squares[i][j] = this.getPlayer();
    this.setState({
      history: history.concat([
        {
          squares: squares,
        },
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  handleToggle(order) {
    this.setState({
      historyOrder: !order,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: step % 2 === 0,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const result = calculateResult(current.squares);
    const toggle = (
      <button onClick={() => this.handleToggle(this.state.historyOrder)}>
        Toggle
      </button>
    );

    const moves = history.map((step, move) => {
      let desc = move ? 'Move #' + move : 'Game start';
      if (move === this.state.stepNumber) {
        desc = <b>{desc}</b>;
      }
      return (
        <li key={move}>
          <a href="#moveHistory" onClick={() => this.jumpTo(move)}>
            {desc}
          </a>
        </li>
      );
    });
    if (this.state.historyOrder === false) {
      moves.reverse();
    }
    const movesList = this.state.historyOrder ? (
      <ol>{moves}</ol>
    ) : (
      <ol reversed>{moves}</ol>
    );

    const status = result.winner
      ? 'Winner: ' + result.winner
      : 'Next player: ' + this.getPlayer();

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i, j) => this.handleClick(i, j)}
            highlightLine={result.line}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <div>{toggle}</div>
          {movesList}
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById('root'));

function calculateResult(squares) {
  // check x lines
  for (let i = 0; i < 3; i++) {
    if (
      squares[i][0] &&
      squares[i][0] === squares[i][1] &&
      squares[i][0] === squares[i][2]
    ) {
      return {
        winner: squares[i][0],
        line: [{x: i, y: 0}, {x: i, y: 1}, {x: i, y: 2}],
      };
    }
  }
  // check y lines
  for (let i = 0; i < 3; i++) {
    if (
      squares[0][i] &&
      squares[0][i] === squares[1][i] &&
      squares[0][i] === squares[2][i]
    ) {
      return {
        winner: squares[0][i],
        line: [{x: 0, y: i}, {x: 1, y: i}, {x: 2, y: i}],
      };
    }
  }
  // check slanting lines
  if (
    squares[0][0] &&
    squares[0][0] === squares[1][1] &&
    squares[0][0] === squares[2][2]
  ) {
    return {
      winner: squares[0][0],
      line: [{x: 0, y: 0}, {x: 1, y: 1}, {x: 2, y: 2}],
    };
  }
  if (
    squares[2][0] &&
    squares[2][0] === squares[1][1] &&
    squares[2][0] === squares[0][2]
  ) {
    return {
      winner: squares[2][0],
      line: [{x: 2, y: 0}, {x: 1, y: 1}, {x: 0, y: 2}],
    };
  }

  return {
    winner: null,
    line: null,
  };
}
