const modulePath = "modules/mastertomnl-domain-sheet";
const folderPath = `${modulePath}/data`;

class MasterTomNLDomainSheet5E extends dnd5e.applications.actor.ActorSheet5eCharacter {
    constructor(...args) {
        super(...args);
    }

    get template() {
        if (!game.user.isGM && this.actor.limited) return "systems/dnd5e/templates/actors/limited-sheet.hbs";
        return `${modulePath}/template/domain-sheet.html`;
    }
    
    static cleanName(name) {
        return name.replace(/[^\w\s]/gi, '').replace(/ /g, "-").toLowerCase();
    }
    
    static getFileNameForActor(actor) {
        return actor._id + ".json";
    }
    
    async getDomain(actor) {
        console.log(`MasterTomNLDomainSheet5E | Getting domain info from file for ${actor._id}`);
        let filename = MasterTomNLDomainSheet5E.getFileNameForActor(actor);
        
        fetch(`${modulePath}/data/${filename}`)
            .then(response => {
                if (response.ok)
                    return response.json();
                console.error(`MasterTomNLDomainSheet5E | Failed to load domain ${filename}: [${response.status}] ${response.statusText}`);
            })
            .then(data => {
                console.log(data);
            });
    }
    
    static async saveDomain(actor, domain) {
        let filename = MasterTomNLDomainSheet5E.getFileNameFromActor(actor);
        let file = new File(JSON.stringify(Object.keys(domain)), filename, { type: blob.type, lastModified: new Date() });
        
        try {
            return await FilePicker.upload(this.SOURCE, this.folderPath, file);
        } catch (e) {
            console.log(`MasterTomNLDomainSheet5E | Not able to upload file ${filename}`);
            console.log(e);
        }
    }
    
    async getData() {
        const data = await super.getData();
        data["domain"] = await this.getDomain(this.actor);
        return data;
    }
    
    static get defaultOptions() {
        const options = super.defaultOptions;

        mergeObject(options, {
            classes: ["dnd5e", "sheet", "actor", "character", "mastertomnl-domain-sheet"],
            width:750,
            height: 900
        });
        return options;
    }
}

Hooks.once('init', async function () {
    console.log("MasterTomNL-Domain-Sheet-5e | Initialized");
    Actors.registerSheet('dnd5e', MasterTomNLDomainSheet5E, {
        types: ['character'],
        makeDefault: false
    });
});