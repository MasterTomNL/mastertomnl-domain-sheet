const modulePath = "modules/mastertomnl-domain-sheet";
const mName = "mastertomnl-domain-sheet";
const preFlix = "flags.mastertomnl-domain-sheet.";

class MasterTomNLDomainSheet5E extends dnd5e.applications.actor.ActorSheet5eCharacter {
    get template() {
        if (!game.user.isGM && this.actor.limited) return "systems/dnd5e/templates/actors/limited-sheet.hbs";
        return `${modulePath}/template/domain-sheet.html`;
    }
    
    async saveDomain(html) {
        console.log(`MasterTomNLDomainSheet5E | Saving domain info to file for ${this.actor.name}`);
        this.actor.setFlag(mName, "commander", this.getFieldVal(html, 'commander'));
        this.actor.setFlag(mName, "size", this.getFieldVal(html, 'size'));
        this.actor.setFlag(mName, "powerdie", this.getFieldVal(html, 'powerdie'));
        this.actor.setFlag(mName, "diplomacy", this.getFieldVal(html, 'diplomacy'));
        this.actor.setFlag(mName, "espionage", this.getFieldVal(html, 'espionage'));
        this.actor.setFlag(mName, "lore", this.getFieldVal(html, 'lore'));
        this.actor.setFlag(mName, "operations", this.getFieldVal(html, 'operations'));
        this.actor.setFlag(mName, "communications", this.getFieldVal(html, 'communications'));
        this.actor.setFlag(mName, "resolve", this.getFieldVal(html, 'resolve'));
        this.actor.setFlag(mName, "resources", this.getFieldVal(html, 'resources'));
        this.actor.setFlag(mName, "powers", this.getPowers(html));
        this.actor.setFlag(mName, "relations", this.getRelations(html));
        //console.log(this.actor.flags);
    }
    
    /*
     * function to get a field value from our character sheet
     */
    getFieldVal(html, name) {
        return $(html).find('[name="flags.mastertomnl-domain-sheet.'+name+'"]').val();
    }
    
    /*
     * function to get all powers from our character sheet
     */
    getPowers(html) {
        let powers = [];
        $(html).find('[name="'+preFlix+'power.name[]"]').each(function(index) {
            powers[index] = {"name": $(this).val() };
        });
        $(html).find('[name="'+preFlix+'power.desc[]"]').each(function(index) {
            powers[index]["desc"] = $(this).val();
        });
        // make sure we have at least 3 powers...
        for(var i = powers.length; i < 3; i++) {
            powers[i] = {"name": "", "desc": ""};
        }
        return powers;
    }
    
    /*
     * function to get all relations from our character sheet
     */
    getRelations(html) {
        let relations = [];
        $(html).find('[name="'+preFlix+'relation.name[]"]').each(function(index) {
            relations[index] = {"name": $(this).val() };
        });
        $(html).find('[name="'+preFlix+'relation.standing[]"]').each(function(index) {
            relations[index]["standing"] = $(this).val();
        });
        $(html).find('[name="'+preFlix+'relation.size[]"]').each(function(index) {
            relations[index]["size"] = $(this).val();
        });
        // make sure we have at least 3 relations...
        for(var i = relations.length; i < 3; i++) {
            relations[i] = {"name": "", "standing": "", "size": ""};
        }
        return relations;
    }
    
    static get defaultOptions() {
        const options = super.defaultOptions;
        // sheet window options
        mergeObject(options, {
            classes: ["dnd5e", "sheet", "actor", "character", "mastertomnl-domain-sheet"],
            width:750,
            height: 900
        });
        return options;
    }
    
    async getData(options) {
        const context = await super.getData(options);
        context.isGM = game.user.isGM;
        return context;
    }
    
    activateListeners(html) {
        super.activateListeners(html);
        // watch the change of the import-policy-selector checkboxes
        $(html)
            .find(['input', 'select', 'textarea'].join(","))
            .on("change", (event) => {
                this.saveDomain(html);
            });
        
        // when you click on the + we will add a (blank) relation
        $(html)
            .find('#add-relation')
            .on("click", (event) => {
                this.addRelation(html);
            });

        return true;
    }
    
    /*
     * function to add a relation
     */
    addRelation(html) {
        console.log("MasterTomNL-Domain-Sheet-5e | Add a relation.");
        // get existing relations
        let relations = this.getRelations(html);
        // add a (blank) relation
        relations.push({"name": "", "standing": "", "size": ""});
        // save it to FLAGS
        this.actor.setFlag(mName, "relations", relations);
        return ;
    }
}

Hooks.once('init', async function () {
    console.log("MasterTomNL-Domain-Sheet-5e | Initialized");
    Actors.registerSheet('dnd5e', MasterTomNLDomainSheet5E, {
        types: ['character'],
        makeDefault: false
    });
});
