'use strict'

class Game {
    static Operations = {
        AND: 'A',
        OR: 'O',
        XOR: 'X',
        NOT: 'N',
        SHL: 'ARROWLEFT',
        SHR: 'ARROWRIGHT',
    }
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
    #shlButton
    #shrButton
    #andRadio
    #orRadio
    #xorRadio
    #intervalId
    #intervalMs = 1000
    //#endregion Private attributes

    //#region Public methods and constructor
    constructor() {
        this.#board = document.querySelector('.board')
        this.#notButton = document.getElementById('notButton')
        this.#shlButton = document.getElementById('shlButton')
        this.#shrButton = document.getElementById('shrButton')
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
        document.addEventListener('keydown', (e) => { document.title = e.key; this.#processKey(e.key.toUpperCase()) })
        this.#notButton.addEventListener('click', () => { this.#not() })
        this.#shlButton.addEventListener('click', () => { this.#shl() })
        this.#shrButton.addEventListener('click', () => { this.#shr() })
        this.#andRadio.addEventListener('change', (e) => { if (e.target.checked) this.#nextOperation = Game.Operations.AND })
        this.#orRadio.addEventListener('change', (e) => { if (e.target.checked) this.#nextOperation = Game.Operations.OR })
        this.#xorRadio.addEventListener('change', (e) => { if (e.target.checked) this.#nextOperation = Game.Operations.XOR })

        this.#board.style.visibility = 'visible'
    }

    #processKey(key) {
        switch (key) {
            case Game.Operations.NOT:
            case 'ARROWUP':
                this.#not()
                break
            case Game.Operations.SHL:
                this.#rol()
                break
            case Game.Operations.SHR:
                this.#ror()
                break
            case Game.Operations.AND:
                document.getElementById('andRadio').checked = true
                this.#nextOperation = Game.Operations.AND
                break
            case Game.Operations.OR:
                document.getElementById('orRadio').checked = true
                this.#nextOperation = Game.Operations.OR
                break
            case Game.Operations.XOR:
                document.getElementById('xorRadio').checked = true
                this.#nextOperation = Game.Operations.XOR
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
        //if (this.#currentRow === this.#bottomRow) {
        else {
            //this.#bottomRow--
            this.#doOperation()
            this.#currentValue = this.#randomValue()
            this.#currentRow = 0
        }
        this.#displayRow()
    }

    #start() {
        if (this.#intervalId) clearInterval(this.#intervalId)
        this.#currentRow = 0
        this.#targetValue = this.#randomValue()
        this.#displayRow(this.#numRows - 1, this.#targetValue)
        this.#bottomRow = this.#numRows - 2

        this.#currentValue = this.#randomValue()
        this.#displayRow()
        this.#nextOperation = Game.Operations.AND

        if (this.#intervalId) clearInterval(this.#intervalId)
        this.#intervalId = setInterval(() => { this.#intervalCallback() }, this.#intervalMs)
    }

    #doOperation() {
        if (this.#bottomValue === undefined) {
            this.#bottomValue = this.#currentValue
        }
        else {
            switch (this.#nextOperation) {
                case Game.Operations.AND:
                    this.#bottomValue &= this.#currentValue;
                    break;
                case Game.Operations.OR:
                    this.#bottomValue |= this.#currentValue;
                    break;
                case Game.Operations.XOR:
                    this.#bottomValue ^= this.#currentValue;
                    break;
            }
        }
        this.#displayRow(this.#bottomRow, this.#bottomValue)
    }

    #not() {
        this.#currentValue = ~this.#currentValue & this.#maxValue
        this.#displayRow()
    }

    #shl() {
        this.#currentValue = (this.#currentValue << 1) & this.#maxValue
        this.#displayRow()
    }

    #shr() {
        this.#currentValue = (this.#currentValue >> 1) & this.#maxValue
        this.#displayRow()
    }

    #rol() {
        const msb = (this.#currentValue >> (8 - 1))
        this.#currentValue = ((this.#currentValue << 1) | msb) & this.#maxValue
        this.#displayRow()
    }

    #ror() {
        const lsb = this.#currentValue & 1
        this.#currentValue = ((this.#currentValue >> 1) | (lsb << this.#numCols-1)) & this.#maxValue
        this.#displayRow()
    }

    #debug() {
        document.getElementById('message').innerText = this.#currentValue // `${this.#currentRow} ${this.#currentValue} ${this.#bottomRow} ${this.#bottomValue} ${this.#nextOperation}`
    }
    //#endregion Private methods
}
