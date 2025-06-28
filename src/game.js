'use strict'

class Game {
    //#region Private attributes
    #numCols = 8
    #numRows = 13
    #maxValue = (1 << this.#numCols) - 1
    #targetValue
    #currentValue
    #currentRow
    #bottomValue
    #bottomRow
    #nextOperation

    #board
    #rows
    #notButton
    #rolButton
    #rorButton
    #andRadio
    #orRadio
    #xorRadio
    #intervalId
    #intervalMs = 1000

    static Operations = {
        AND: (g) => { g.#bottomValue &= g.#currentValue },
        OR: (g) => { g.#bottomValue |= g.#currentValue },
        XOR: (g) => { g.#bottomValue ^= g.#currentValue },
        NOT: (g) => { g.#currentValue = ~g.#currentValue & g.#maxValue },
        SHL: (g) => { g.#currentValue = (g.#currentValue << 1) & g.#maxValue },
        SHR: (g) => { g.#currentValue = (g.#currentValue >> 1) & g.#maxValue },
        ROL: (g) => {
            const msb = (g.#currentValue >> (g.#numCols - 1)) & 1
            g.#currentValue = ((g.#currentValue << 1) | msb) & g.#maxValue
        },
        ROR: (g) => {
            const lsb = g.#currentValue & 1
            g.#currentValue = ((g.#currentValue >> 1) | (lsb << (g.#numCols - 1))) & g.#maxValue
        },
    }
    //#endregion Private attributes

    //#region Public methods and constructor
    constructor() {
        this.#board = document.querySelector('.board')
        this.#notButton = document.getElementById('notButton')
        this.#rolButton = document.getElementById('rolButton')
        this.#rorButton = document.getElementById('rorButton')
        this.#andRadio = document.getElementById('andRadio')
        this.#orRadio = document.getElementById('orRadio')
        this.#xorRadio = document.getElementById('xorRadio')
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
        document.addEventListener('keydown', (e) => { this.#processKey(e) })
        this.#notButton.addEventListener('click', (e) => { this.#doOperation("NOT") })
        this.#rolButton.addEventListener('click', (e) => { this.#doOperation("ROL") })
        this.#rorButton.addEventListener('click', (e) => { this.#doOperation("ROR") })
        this.#andRadio.addEventListener('change', (e) => { if (e.target.checked) this.#nextOperation = "AND" })
        this.#orRadio.addEventListener('change', (e) => { if (e.target.checked) this.#nextOperation = "OR" })
        this.#xorRadio.addEventListener('change', (e) => { if (e.target.checked) this.#nextOperation = "XOR" })

        this.#board.style.visibility = 'visible'
    }

    #processKey(e) {
        const key = e.key.toUpperCase()
        switch (key) {
            case "A":
                this.#andRadio.checked = true
                this.#nextOperation = "AND" // executes #doOperation() when it reaches the bottom line
                break
            case "O":
                this.#orRadio.checked = true
                this.#nextOperation = "OR"
                break
            case "X":
                this.#xorRadio.checked = true
                this.#nextOperation = "XOR"
                break
            case 'N':
            case 'ARROWUP':
                this.#doOperation("NOT") // Do immediately
                e.preventDefault()
                break
            case 'ARROWLEFT':
                this.#doOperation("ROL")
                e.preventDefault()
                break
            case 'ARROWRIGHT':
                this.#doOperation("ROR")
                e.preventDefault()
                break
            case 'ARROWDOWN':
                this.#intervalCallback()
                break
            case 'C':
                this.#clearBoard()
                break
        }
    }

    #displayRow(row = this.#currentRow, value = this.#currentValue) {
        const cells = this.#rows[row].querySelectorAll('.boardcell')
        const bits = value.toString(2).padStart(this.#numCols, '0')
        cells.forEach((cell, i) => { cell.setAttribute('data-value', bits[i]) })

        this.#debug()
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
        if (this.#currentRow < this.#bottomRow) {
            this.#clearRow()
            this.#currentRow++
        }
        else {
            //this.#bottomRow--
            if (this.#bottomValue === undefined) {
                this.#bottomValue = this.#currentValue
            }
            else {
                this.#doOperation()
            }
            this.#displayRow(this.#bottomRow, this.#bottomValue)
            this.#currentValue = this.#randomValue()
            this.#currentRow = 0
        }
        this.#displayRow()
    }

    #doOperation(op = this.#nextOperation) {
        if (op && op in Game.Operations) {
            Game.Operations[op](this)
            this.#displayRow()
            this.#debug()
        }
    }

    #start() {
        if (this.#intervalId) clearInterval(this.#intervalId)
        this.#currentRow = 0
        this.#targetValue = this.#randomValue()
        this.#displayRow(this.#numRows - 1, this.#targetValue)
        this.#bottomRow = this.#numRows - 2

        this.#currentValue = this.#randomValue()
        this.#displayRow()
        this.#nextOperation = "AND"

        if (this.#intervalId) clearInterval(this.#intervalId)
        this.#intervalId = setInterval(() => { this.#intervalCallback() }, this.#intervalMs)
    }

    #debug() {
        document.getElementById('message').innerText = `currentRow:${this.#currentRow} currentValue:${this.#currentValue} bottomRow:${this.#bottomRow} bottomValue:${this.#bottomValue} nextOperation:${this.#nextOperation}`
    }
    //#endregion Private methods
}
