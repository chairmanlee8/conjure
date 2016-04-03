import Model from 'conjure/model';
import Range from 'conjure/utils/range';
import { mapFromArray } from 'conjure/utils';
import xhr from 'xhr';

class Task extends Model {
    constructor (id = null) {
        super(self => {
            self.id = id;
            self.contents = "";
            self.completed = false;
        });
    }

    static loadFromRemote(...tasks) {
        var taskMap = mapFromArray(tasks, t => t.id);
        xhr({
            uri: "/tasks?q=" + Range.fromArray(tasks.map(t => t.id)),
            method: 'GET'
        },
        function (err, resp, body) {
            if (resp.statusCode == 200) {
                JSON.parse(body).result.forEach(taskJson => {
                    taskMap[taskJson.id].onLoad(taskJson);
                });
            } else {
                alert("Could not connect to server.");
            }
        });
    }

    onLoad(json) {
        this.contents = json.contents;
        this.completed = json.completed;
        super.onLoad(json);
    }

    get uuid () {
        return `task-${this.id}`;
    }
}
