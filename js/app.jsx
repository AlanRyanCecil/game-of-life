'use strict';

const nameOfTheGame = 'The Game of Life';

let environmentWidth = 25;

let living;

let Cell = React.createClass({
    aliveOrDead: function (event, target) {
        $('#' + event.target.id).toggleClass('alive');;
    },
    render: function () {
        return (
            <div id={`cell-${this.props.row}-${this.props.column}`} className="single-cell" onClick={this.aliveOrDead}></div>
        )
    }
});

let Row = React.createClass({
    render: function () {
        let row = [];
        for (let i = 0; i < environmentWidth; i++) {
            row.push(<Cell key={`cell${i}`} row={this.props.row} column={i}/>);
        }
        return ( <div className="single-row">{ row }</div> );
    }
});

let Environment = React.createClass({
    render: function () {
        let columns = [];
        for (let i = 0; i < environmentWidth; i++) {
            columns.push(<Row key={`row${i}`} row={i}/>);
        }
        return ( <div className="environment">{ columns }</div> );
    }
});

let Run = React.createClass({
    getInitialState: function () {
        return {
            running: false,
            label: 'Run',
            living: null
        }
    },
    liveLife: function () {
        if (!this.state.running) {
            this.setState({label: 'Stop'});
            this.state.living = setInterval(_=> {
                this.props.nextFrame();
            }, 100);
        } else {
            this.setState({label:'Run'});
            clearInterval(this.state.living);
        }
        this.setState({running: !this.state.running});
    },
    render: function () {
        return (
            <button className="btn btn-info" onClick={this.liveLife}>{this.state.label}</button>
        );
    }
});

let Button = React.createClass({
    render: function () {
        return (
            <button id={this.props.id} className="btn btn-info" onClick={this.props.buttonFunction}>{this.props.buttonName}</button>
        );
    }
});

let Generation = React.createClass({
    render: function () {
        return (
            <div id="gen-count">{this.props.count}</div>
        );
    }
});

let Main = React.createClass({
    getInitialState: function () {
        return {
            board: null,
            running: false,
            runLabel: 'Start',
            living: null,
            count: 0
        }
    },
    hasNeighbour: function (cell) {
        let id = $(cell).attr('id'),
            row = Number(id.match(/\d+/)[0]),
            column = Number(id.match(/\d+$/)[0]),
            rows = [],
            columns = [],
            neighbour = false;
        for (let x = -1; x < 2; x++) {
            rows.push(row + x);
            columns.push(column + x);
        }
        rows.map(r => {
            columns.map(c => {
                if ($(`#cell-${r}-${c}`).hasClass('alive')) {
                    neighbour = true;
                }
            });
        });
        return neighbour;
    },
    populationCheck: function (cell) {
        let id = $(cell).attr('id'),
            row = Number(id.match(/\d+/)[0]),
            column = Number(id.match(/\d+$/)[0]),
            population = $(`#cell-${row}-${column}`).hasClass('alive') ? -1 : 0,
            rows = [],
            columns = [];
        for (let x = -1; x < 2; x++) {
            rows.push(row + x);
            columns.push(column + x);
        }
        rows.map(r => {
            columns.map(c => {
                if ($(`#cell-${r}-${c}`).hasClass('alive')) {
                    population++;
                }
            });
        });
        if ($(cell).hasClass('alive')) {
            return 2 <= population && population <= 3;
        } else {population
            return population === 3;
        }
    },
    nextFrame: function () {
        let cells = $('.single-cell');
        let nextFrameState = [];

        cells.map((index, cell) => {
            if (this.populationCheck(cell)) {
                nextFrameState.push(true);
            } else {
                nextFrameState.push(false);
            }
        });
        nextFrameState.map((alive, index) => {
            if (alive) {
                $(cells[index]).addClass('alive');
            } else {
                $(cells[index]).removeClass('alive');
            }
        });
        this.setState({count: this.state.count + 1});
    },
    liveLife: function () {
        $('#run-stop').toggleClass('btn-info btn-danger');
        if (!this.state.running) {
            this.setState({runLabel: 'Stop'});
            this.state.living = setInterval(_=> {
                this.nextFrame();
            }, 50);
        } else {
            this.setState({runLabel:'Start'});
            clearInterval(this.state.living);
        }
        this.setState({running: !this.state.running});
    },
    advanceToNextFrame: function () {
        if (!this.state.running) this.nextFrame();
    },
    saveBoard: function () {
        let savingBoard = [];
        $('.single-cell').map((index, cell) => {
            if ($(cell).hasClass('alive')) {
                savingBoard.push(true);
            } else {
                savingBoard.push(false);
            }
        });
        $('#save-button').removeClass('btn-info');
        $('#save-button').addClass('btn-warning');
        this.setState({board: savingBoard});
    },
    clearBoard: function () {
        $('#run-stop').removeClass('btn-danger').addClass('btn-info');
        $('.single-cell').map((index, cell) => {
            $(cell).removeClass('alive');
        });
        this.setState({
            runLabel: 'Start',
            running: false,
            count: 0
        });
        clearInterval(this.state.living);
    },
    loadBoard: function () {
        this.clearBoard();
        if (this.state.board) {
            $('.single-cell').map((index, cell) => {
                if (this.state.board[index]) {
                    $(cell).addClass('alive');
                } else {
                    $(cell).removeClass('alive');
                }
            });
        }
        $('#save-button').removeClass('btn-warning');
        $('#save-button').addClass('btn-info');
    },
    randomBoard: function () {
        let lastAlive = false;
        this.clearBoard();
        $('.single-cell').map((index, cell) => {
            let fiftyPer = Math.ceil(Math.random() * 9);
            if (fiftyPer === 9) {
                lastAlive = true;
                $(cell).addClass('alive');
            } else if (this.hasNeighbour(cell)) {
                if (fiftyPer % 3 === 0) {
                    $(cell).addClass('alive');
                } else {
                    lastAlive = false;
                }
            }
        });
    },
    render: function () {
        return (
            <section>
                <h1 className="main-title text-center">{nameOfTheGame}</h1>
                <Environment/>
                <div className="container col-sm-5">
                    <Button id="run-stop" buttonFunction={this.liveLife} buttonName={this.state.runLabel}/>
                    <Button buttonFunction={this.advanceToNextFrame} buttonName="Next"/>
                    <Button buttonFunction={this.randomBoard} buttonName="Raondom"/>
                    <Button id="save-button" buttonFunction={this.saveBoard} buttonName="Save"/>
                    <Button id="load-button" buttonFunction={this.loadBoard} buttonName="Load"/>
                    <Button buttonFunction={this.clearBoard} buttonName="Clear"/>
                    <h2 id="gen-label">Generation:</h2>
                    <Generation count={this.state.count}/>
                </div>
            </section>
        );
    },
    componentDidMount: function () {
        this.randomBoard();
        this.liveLife();
    }
});

ReactDOM.render(<Main/>, document.getElementById('root'));