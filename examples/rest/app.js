import Cache from 'conjure/cache';
import Model from 'conjure/model';
import Range from 'conjure/utils/range';
import { mapFromArray } from 'conjure/utils';
import xhr from 'xhr';

class Dice extends Model {
    constructor (id) {
        super(self => {
            self.id = id;
            self.sides = null;
            self.roll = null;
            self.time = null;
        });
    }

    static loadFromRemote (...models) {
        // Collect ids and call API
        var modelMap = mapFromArray(models, m => m.id);

        xhr({
            uri: "http://localhost:8000/dice?q=" + Range.fromArray(models.map(m => m.id)),
            method: 'GET'
        },
        function (err, resp, body) {
            if (resp.statusCode == 200) {
                JSON.parse(body).result.forEach(modelJson => {
                    modelMap[modelJson.id].onLoad(modelJson);
                });
            } else {
                alert("Unable to reach the server.");
            }
        });
    }

    onLoad (json) {
        this.sides = json.sides;
        this.roll = json.roll;
        this.time = json.time;
        super.onLoad(json);

        // Normally we wouldn't put render code here...this is an artifact of how this example is architected.
        document.getElementById(`Dice${this.id}`).innerText =
            `Dice #${this.id}, ${this.sides}-sided, rolled with ${this.roll}`;
    }

    get uuid () {
        return `dice-${this.id}`;
    }
}

document.getElementById('LoadDie').addEventListener('click', function (ev) {
    Cache.hold();

    var dice1 = new Dice(1),
        dice2 = new Dice(2),
        dice3 = new Dice(3),
        dice7 = new Dice(7),
        dice10 = new Dice(10);

    Cache.release();
});
