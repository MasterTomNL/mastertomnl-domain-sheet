const modulePath = "modules/mastertomnl-domain-sheet";
const mName = "mastertomnl-domain-sheet";

class MasterTomNLDomainSheet5E extends dnd5e.applications.actor.ActorSheet5eCharacter {
    get template() {
        if (!game.user.isGM && this.actor.limited) return "systems/dnd5e/templates/actors/limited-sheet.hbs";
        return `${modulePath}/template/domain-sheet.html`;
    }
    
    async saveDomain(html) {
        console.log(`MasterTomNLDomainSheet5E | Saving domain info to file for ${this.actor._id}`);
        let filename = MasterTomNLDomainSheet5E.getFileNameForActor(this.actor);
        let preFlix = "flags.mastertomnl-domain-sheet.";
        this.actor.setFlag(mName, "commander", $(html).find('[name="'+preFlix+'commander"]').val());
        this.actor.setFlag(mName, "size", $(html).find('[name="'+preFlix+'size"]').val());
        this.actor.setFlag(mName, "powerdie", $(html).find('[name="'+preFlix+'powerdie"]').val());
        this.actor.setFlag(mName, "diplomacy", $(html).find('[name="'+preFlix+'diplomacy"]').val());
        this.actor.setFlag(mName, "espionage", $(html).find('[name="'+preFlix+'espionage"]').val());
        this.actor.setFlag(mName, "lore", $(html).find('[name="'+preFlix+'lore"]').val());
        this.actor.setFlag(mName, "operations", $(html).find('[name="'+preFlix+'operations"]').val());
        this.actor.setFlag(mName, "communications", $(html).find('[name="'+preFlix+'communications"]').val());
        this.actor.setFlag(mName, "resolve", $(html).find('[name="'+preFlix+'resolve"]').val());
        this.actor.setFlag(mName, "resources", $(html).find('[name="'+preFlix+'resources"]').val());
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
    
    activateListeners(html) {
        super.activateListeners(html);
        // watch the change of the import-policy-selector checkboxes
        $(html)
            .find(['input', 'select'].join(","))
            .on("change", (event) => {
                this.saveDomain(html);
            });
        return true;
    }
}

Hooks.once('init', async function () {
    console.log("MasterTomNL-Domain-Sheet-5e | Initialized");
    Actors.registerSheet('dnd5e', MasterTomNLDomainSheet5E, {
        types: ['character'],
        makeDefault: false
    });
});
