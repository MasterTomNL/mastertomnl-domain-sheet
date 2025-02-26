const modulePath = "modules/mastertomnl-domain-sheet";
const mName = "mastertomnl-domain-sheet";
const preFlix = "flags.mastertomnl-domain-sheet.";

class MasterTomNLDomainSheet5E extends dnd5e.applications.actor.ActorSheet5eCharacter {

    get template() {
        if (!game.user.isGM && this.actor.limited) return "systems/dnd5e/templates/actors/limited-sheet.hbs";
        return `${modulePath}/template/domain-sheet.hbs`;
    }
    
    async saveDomain(html) {
        console.log(`MasterTomNLDomainSheet5E | Saving domain info to flags for ${this.actor.name}`);
        this.actor.setFlag(mName, "powers", this.getPowers(html));
        this.actor.setFlag(mName, "relations", this.getRelations(html));
        this.actor.setFlag(mName, "actions", this.getActions(html));
        if (game.user.isGM) {
            this.actor.setFlag(mName, "officers", this.getOfficers(html));
            this.actor.setFlag(mName, "features", this.getFeatures(html));
        }
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

        let ids = $(html).find('[name="'+preFlix+'action.title[]"]');
        let titles = $(html).find('[name="'+preFlix+'action.title[]"]');
        let rolls = $(html).find('[name="'+preFlix+'action.roll[]"]');
        let results = $(html).find('[name="'+preFlix+'action.result[]"]');

        for (var i = 0; i < ids.length; i++) {
            actions.push({
                "id": $(ids[i]).attr('data-action-id'),
                "title": $(titles[i]).val(),
                "roll": $(rolls[i]).val(),
                "result": $(results[i]).val()
            });
        }
        return actions;
    }
    
    /*
     * get all officers from our character sheet
     */
    getOfficers(html) {
        let officers = [];

        let ids = $(html).find('[name="'+preFlix+'officer.name[]"]');
        let images = $(html).find('[name="'+preFlix+'officer.img[]"]');
        let titles = $(html).find('[name="'+preFlix+'officer.title[]"]');
        let names = $(html).find('[name="'+preFlix+'officer.name[]"]');
        let bonuses = $(html).find('[name="'+preFlix+'officer.bonus[]"]');
        let visibles = $(html).find('[name="'+preFlix+'officer.visible[]"]');
        
        for (var i=0; i < images.length; i++) {
            officers.push({
                "id": $(ids[i]).attr('data-officer-id'),
                "img": $(images[i]).attr('src'),
                "title": $(titles[i]).val(),
                "name": $(names[i]).val(),
                "bonus": $(bonuses[i]).val(),
                "visible": $(visibles[i]).val()
            });
        }
        return officers;
    }

    getFeatures(html) {
        let features = [];

        let ids = $(html).find('[name="'+preFlix+'feature.title[]"]');
        let images = $(html).find('[name="'+preFlix+'feature.img[]"]');
        let titles = $(html).find('[name="'+preFlix+'feature.title[]"]');
        let bonuses = $(html).find('[name="'+preFlix+'feature.bonus[]"]');
        let visibles = $(html).find('[name="'+preFlix+'feature.visible[]"]');

        for (var i=0; i < ids.length; i++) {
            features.push({
                "id": $(ids[i]).attr('data-feature-id'),
                "img": $(images[i]).attr('src'),
                "title": $(titles[i]).val(),
                "bonus": $(bonuses[i]).val(),
                "visible": $(visibles[i]).val()
            });
        }
        return features;
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
        console.log(`MasterTomNLDomainSheet5E | Get Data for ${this.actor.name}`);
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

        // When you click on the show/hide button in the officer tab
        $(html)
            .find('input.officer-visibility')
            .on('click', (event) => {
                this.toggleOfficer(html, event.target.getAttribute('data-officer-id'));
            });

        // when you click on the + we will add a (blank) officer
        $(html)
            .find('#add-feature')
            .on("click", (event) => {
                this.addFeature(html);
            });

        // when you click on the delete button
        $(html)
            .find('a.delete-feature')
            .on("click", (event) => {
                this.deleteFeature(html, event.target.getAttribute("data-feature-id"));
            });

        // When you click on the show/hide button in the feature tab
        $(html)
            .find('input.feature-visibility')
            .on('click', (event) => {
                this.toggleFeature(html, event.target.getAttribute('data-feature-id'));
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
    
    /**
     * Function to delete a relation by its name
     */
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
    
    /**
     * Function to delete an action by its id
     */
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
        officers.push({
            "id": this.getUuid(),
            "img": "",
            "name": "",
            "title": "",
            "bonus": "",
            "visible": "hide"
        });
        // save it to FLAGS
        this.actor.setFlag(mName, "officers", officers);
        return ;
    }
    
    /**
     * Function to delete an officer by its id
     */
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

    /**
     * Function to toggle an officer by its id
     */
    toggleOfficer(html, id) {
        console.log("MasterTomNL-Domain-Sheet-5e | Toggle an officer.");
        let officers = this.getOfficers(html);
        for (var i=0; i < officers.length; i++) {
            if (officers[i].id === id) {
                officers[i].visible = officers[i].visible === "hide" ? "show" : "hide";
            }
        }
        this.actor.setFlag(mName, "officers", officers);
    }

    /**
     * Feature to add a feature
     */
    addFeature(html) {
        console.log("MasterTomNL-Domain-Sheet-5e | Add Feature.");
        let features = this.getFeatures(html);

        features.push({
            "id": this.getUuid(),
            "img": "",
            "title": "",
            "bonus": "",
            "visible": "hide"
        });

        // save it to FLAGS
        this.actor.setFlag(mName, "features", features);
        return;
    }
 
    /**
     * Function to delete a feature by its id
     */
    deleteFeature(html, id) {
        console.log("MasterTomNL-Domain-Sheet-5e | Delete Feature.");
        let features = this.getFeatures(html);
        for (var i=0; i < features.length; i++) {
            if (features[i].id == id) {
                features.splice(i, 1);
                break;
            }
        }
        this.actor.setFlag(mName, "features", features);
        return ;
    }

    /**
     * Function to toggle an feature by its id
     */
    toggleFeature(html, id) {
        console.log("MasterTomNL-Domain-Sheet-5e | Toggle a Feature.");
        let features = this.getFeatures(html);
        for (var i=0; i < features.length; i++) {
            if (features[i].id === id) {
                features[i].visible = features[i].visible === "hide" ? "show" : "hide";
            }
        }
        this.actor.setFlag(mName, "features", features);
    }
}

Hooks.once('init', async function () {
    console.log("MasterTomNL-Domain-Sheet-5e | Initialized");
    Actors.registerSheet('dnd5e', MasterTomNLDomainSheet5E, {
        types: ['character'],
        makeDefault: false
    });

    Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
        // If the user is the GM, it should always show the officers
        if (game.user.isGM) {
            return options.fn(this);
        }

        return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    });
});
