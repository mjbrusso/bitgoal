'use strict'

class Game {
    static OPERATIONS = {
        AND: 'A',
        OR: 'O',
        XOR: 'X',
        NOT: 'N'
    }
    //#region Private attributes
    #numCols = 8
    #numRows = 10
    #maxValue = (1 << this.#numCols) - 1
    #targetValue
    #newValue
    #lastRow
    #currentRow = 0
    #nextOperation

    #board
    #rows
    #notCheckBox
    #intervalId
    //#endregion Private attributes

    //#region Public methods and constructor
    constructor() {
        this.#board = document.querySelector('.board')
        this.#notCheckBox = document.getElementById('notCheckbox')
        this.#initUI()
        this.#start()
    }
    //#endregion Public methods and constructor

    //#region Private methods
    #initUI() {
        const templateRow = document.querySelector('.boardrow')
        if (this.#board && templateRow) {
            const templateCell = templateRow.querySelector('.boardcell')
            if (templateCell) {
                for (let j = 1; j < this.#numCols; j++) {
                    const cloneCell = templateCell.cloneNode(true)
                    templateRow.appendChild(cloneCell)
                }
            }
            for (let i = 1; i < this.#numRows; i++) {
                const cloneRow = templateRow.cloneNode(true)
                this.#board.appendChild(cloneRow)
            }
        }
        this.#rows = Array.from(document.querySelectorAll('.boardrow'))
        // Eventos
        document.addEventListener('keydown', (e) => { this.#processKey(e.key.toUpperCase()) })
        this.#notCheckBox.addEventListener('change', () => { this.#not() })
        this.#board.style.visibility = 'visible'
    }

    #processKey(key) {
        switch (key) {
            case Game.OPERATIONS.NOT:
                this.#not()
                this.#notCheckBox.checked = !this.#notCheckBox.checked
                break;
            case Game.OPERATIONS.AND:
                document.getElementById('andRadio').checked = true
                this.#nextOperation =  Game.OPERATIONS.AND
                break;
            case Game.OPERATIONS.OR:
                document.getElementById('orRadio').checked = true
                this.#nextOperation =  Game.OPERATIONS.OR
                break;
            case Game.OPERATIONS.XOR:
                document.getElementById('xorRadio').checked = true
                this.#nextOperation =  Game.OPERATIONS.XOR
                break;
            case 'C':
                this.#clearBoard()
                break;
        }
    }

    #setValue(val) {
        this.#newValue = val
        this.#displayRow()
    }

    #displayRow(row = this.#currentRow, value = this.#newValue) {
        const cells = this.#rows[row].querySelectorAll('.boardcell')
        const bits = value.toString(2).padStart(this.#numCols, '0')
        cells.forEach((cell, i) => { cell.setAttribute('data-value', bits[i]) })
    }

    #clearRow(row) {
        if (row === undefined) row = this.#currentRow
        const cells = this.#rows[row].querySelectorAll('.boardcell')
        cells.forEach(cell => { cell.setAttribute('data-value', '') })
    }

    #clearBoard() {
        for (let i = 1; i < this.#numRows; i++)
            this.#clearRow(i)
        this.#start()
    }

    #randomValue() {
        return Math.floor(Math.random() * this.#maxValue) + 1
    }

    #intervalCallback() {
        if (this.#currentRow < this.#lastRow) {
            this.#clearRow()
            this.#currentRow++
            this.#displayRow()
        } else {
            //this.#lastRow--
            this.#currentRow = 0
            this.#setValue(this.#randomValue())
        }
    }

    #start() {
        if (this.#intervalId) clearInterval(this.#intervalId)
        this.#currentRow = 0
        this.#targetValue = this.#randomValue()
        this.#displayRow(this.#numRows - 1, this.#targetValue)
        this.#lastRow = this.#numRows - 2
        this.#setValue(this.#randomValue())
        this.#nextOperation = Game.OPERATIONS.AND

        if (this.#intervalId) clearInterval(this.#intervalId)
        this.#intervalId = setInterval(() => { this.#intervalCallback() }, 500 /* ms */)
    }

    #not() {
        this.#setValue(~this.#newValue & this.#maxValue)
    }
    //#endregion Private methods
}
