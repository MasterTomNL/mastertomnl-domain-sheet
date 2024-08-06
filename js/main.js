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
        /*this.actor.setFlag(mName, "commander", this.getFieldVal(html, 'commander'));
        this.actor.setFlag(mName, "size", this.getFieldVal(html, 'size'));
        this.actor.setFlag(mName, "powerdie", this.getFieldVal(html, 'powerdie'));
        this.actor.setFlag(mName, "diplomacy", this.getNumber(html, 'diplomacy'));
        this.actor.setFlag(mName, "espionage", this.getNumber(html, 'espionage'));
        this.actor.setFlag(mName, "lore", this.getNumber(html, 'lore'));
        this.actor.setFlag(mName, "operations", this.getNumber(html, 'operations'));
        this.actor.setFlag(mName, "communications", this.getNumber(html, 'communications'));
        this.actor.setFlag(mName, "resolve", this.getNumber(html, 'resolve'));
        this.actor.setFlag(mName, "resources", this.getNumber(html, 'resources'));
        */
        this.actor.setFlag(mName, "powers", this.getPowers(html));
        this.actor.setFlag(mName, "relations", this.getRelations(html));
        this.actor.setFlag(mName, "actions", this.getActions(html));
        this.actor.setFlag(mName, "officers", this.getOfficers(html));
        console.log(this.actor);
    }
    
    /*
     * get a field value from our character sheet
     */
    getFieldVal(html, name) {
        return $(html).find('[name="flags.mastertomnl-domain-sheet.'+name+'"]').val();
    }
    /* return FieldVal as a Number */
    getNumber(html, name) {
        return Number(this.getFieldVal(html, name));
    }
    
    /*
     * get all powers from our character sheet
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
     * get all relations from our character sheet
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

        return relations;
    }
    
    /*
     * get all actions from our character sheet
     */
    getActions(html) {
        let actions = [];
        $(html).find('[name="'+preFlix+'action.title[]"]').each(function(index) {
            actions[index] = {"title": $(this).val()};
        });
        $(html).find('[name="'+preFlix+'action.roll[]"]').each(function(index) {
            actions[index]["roll"] = $(this).val();
        });
        $(html).find('[name="'+preFlix+'action.result[]"]').each(function(index) {
            actions[index]["result"] = $(this).val();
        });
        return actions;
    }
    
    /*
     * get all officers from our character sheet
     */
    getOfficers(html) {
        let officers = [];
        let ids = $(html).find('.delete-officer');
        let images = $(html).find('[name="'+preFlix+'officer.img[]"]');
        let titles = $(html).find('[name="'+preFlix+'officer.title[]"]');
        let names = $(html).find('[name="'+preFlix+'officer.name[]"]');
        let bonuses = $(html).find('[name="'+preFlix+'officer.bonus[]"]');
        
        for (var i=0; i<images.length; i++) {
            officers.push({
                "id": $(ids[i]).attr('data-officer-id'),
                "img": $(images[i]).attr('src'),
                "title": $(titles[i]).val(),
                "name": $(names[i]).val(),
                "bonus": $(bonuses[i]).val()
            });
        }
        return officers;
    }
    
    getUuid() {
        return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }
    
    static get defaultOptions() {
        const options = super.defaultOptions;
        // sheet window options
        foundry.utils.mergeObject(options, {
            classes: ["dnd5e", "sheet", "actor", "character", "mtds"],
            width:750,
            height: 900
        });
        return options;
    }
    
    async getData(options) {
        const context = await super.getData(options);
        context.isGM = game.user.isGM;
        context.skillValues = [-1,0,1,2,2,3,3,3,4];
        context.defenseValues = [10,11,12,13,14,14,15,15,16,16,17,17,17,18];
        // set some default values
        if (!context.actor.flags[mName]) {
            context.actor.flags[mName] = {
                'diplomacy':0,
                'espionage':0,
                'lore':0,
                'operations':0,
                'communications':0,
                'resolve':0,
                'resources':0
            };
        }
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
        // when you click on the delete button
        $(html)
            .find('a.delete-relation')
            .on("click", (event) => {
                this.deleteRelation(html, event.target.getAttribute("data-relation-id"));
            });
        
        // when you click on the + we will add a (blank) action
        $(html)
            .find('#add-action')
            .on("click", (event) => {
                this.addAction(html);
            });
        // when you click on the delete button
        $(html)
            .find('a.delete-action')
            .on("click", (event) => {
                this.deleteAction(html, event.target.getAttribute("data-action-id"));
            });

        // when you click on the + we will add a (blank) officer
        $(html)
            .find('#add-officer')
            .on("click", (event) => {
                this.addOfficer(html);
            });

        // when you click on the delete button
        $(html)
            .find('a.delete-officer')
            .on("click", (event) => {
                this.deleteOfficer(html, event.target.getAttribute("data-officer-id"));
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
        relations.push({"id": this.getUuid(), "name": "", "standing": "", "size": ""});
        // save it to FLAGS
        this.actor.setFlag(mName, "relations", relations);
        return ;
    }
    
    deleteRelation(html, name) {
        console.log("MasterTomNL-Domain-Sheet-5e | Delete a relation.");
        let relations = this.getRelations(html);
        for (var i=0; i < relations.length; i++) {
            if (relations[i].name == name) {
                relations.splice(i, 1);
                break;
            }
        }
        this.actor.setFlag(mName, "relations", relations);
        return ;
    }
    
    /*
     * function to add an action
     */
    addAction(html) {
        console.log("MasterTomNL-Domain-Sheet-5e | Add an action.");
        // get existing actions
        let actions = this.getActions(html);
        // add a (blank) relation
        actions.unshift({"id": this.getUuid(), "title": "", "roll": "", "result": ""});
        // save it to FLAGS
        this.actor.setFlag(mName, "actions", actions);
        return ;
    }
    
    deleteAction(html, id) {
        console.log("MasterTomNL-Domain-Sheet-5e | Delete an action.");
        let actions = this.getActions(html);
        for (var i=0; i<actions.length; i++) {
            if (actions[i].id == id) {
                actions.splice(i, 1);
                break;
            }
        }
        this.actor.setFlag(mName, "actions", actions);
        return ;
    }
    
    /*
     * function to add an officer
     */
    addOfficer(html) {
        console.log("MasterTomNL-Domain-Sheet-5e | Add an officer.");
        // get existing officers
        let officers = this.getOfficers(html);
        // add a (blank) officer
        officers.push({"id": this.getUuid(), "img": "", "name": "", "title": "", "bonus": ""});
        // save it to FLAGS
        this.actor.setFlag(mName, "officers", officers);
        return ;
    }
    
    deleteOfficer(html, id) {
        console.log("MasterTomNL-Domain-Sheet-5e | Delete an officer.");
        let officers = this.getOfficers(html);
        for (var i=0; i<officers.length; i++) {
            if (officers[i].id == id) {
                officers.splice(i, 1);
                break;
            }
        }
        this.actor.setFlag(mName, "officers", officers);
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
