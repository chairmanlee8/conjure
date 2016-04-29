export default class Calendar {
    constructor () {
        this.grid = [];     // format, [week] where week is array of [y, m, d, current_month (bool)]
        this.week = 0;

        let today = new Date();
        this.set(today.getFullYear(), today.getMonth()+1, today.getDate());
    }

    setYear  (y) { this.set(y, this.month, this.date) }
    setMonth (m) { this.set(this.year, m, this.date) }
    setDate  (d) { this.set(this.year, this.month, d) }
    setWeek  (w) { this.week = w }

    get value () {
        return new Date(this.year, this.month-1, this.date);
    }

    set value (d) {
        this.set(d.getFullYear(), d.getMonth()+1, d.getDate());
    }

    set (y, m, d) {
        this.year = y;
        this.month = m;
        this.date = d;

        // Set calendar month to the given month and year. (Month and year in natural units)
        var monthStart = new Date(y, m-1, 1);
        var monthEnd = new Date(y, m, 0);
        var calStart = new Date(y, m-1, 1-monthStart.getDay());
        var calEnd = new Date(y, m, 6-monthEnd.getDay());
        var base = [calStart.getFullYear(), calStart.getMonth()+1, calStart.getDate()];
        var wk = 0, wkDay = 0;

        // Clear previous calendar
        this.grid.length = 0;
        this.grid.push([]);
        this.year = y;
        this.month = m;
        this.date = d;

        // Previous month
        for (var i = 0; i < monthStart.getDay(); i++) {
            this.grid[wk].push([base[0], base[1], base[2] + i, false]);
            wkDay++;
        }

        // Current month
        base = [monthStart.getFullYear(), monthStart.getMonth()+1, monthStart.getDate()];
        for (var i = 0; i < monthEnd.getDate(); i++) {
            this.grid[wk].push([base[0], base[1], base[2] + i, true]);

            // Is this the week?
            if (base[2] + i == d) {
                this.week = wk;
            }

            if (wkDay++ % 7 == 6) {
                this.grid.push([]);
                wk++;
            }
        }

        // Next month
        if (monthEnd.getMonth() == calEnd.getMonth() && monthEnd.getDate() == calEnd.getDate()) {
            // Check empty last row
            if (this.grid[this.grid.length-1].length == 0) {
                this.grid.length -= 1;
            }
            return;
        }

        base = [calEnd.getFullYear(), calEnd.getMonth()+1, 1];
        var ctr = 0;
        for (var i = (monthEnd.getDay() + 1) % 7; i <= calEnd.getDay(); i++) {
            this.grid[wk].push([base[0], base[1], base[2] + (ctr++), false]);
        }

        // Check empty last row
        if (this.grid[this.grid.length-1].length == 0) {
            this.grid.length -= 1;
        }
    }
}
