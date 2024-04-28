
class AccountBookingStatus {
    constructor() {

    }


    initFromSaveData(save_data) {

        this.max_book_level = 270 // TODO: to be computed from save data

        let player_names = save_data[`playerNames`]
        this.players = Array.from({ length: player_names.length }, () => ({}));

        for (let i = 0; i < player_names.length; i++) {
            this.players[i]["name"] = player_names[i]
            this.players[i]["class"] = save_data[`CharacterClass_${i}`]
            this.players[i]["class_name"] = CLASSES[save_data[`CharacterClass_${i}`]]
            this.players[i]["subclasses"] = getClassList(CLASSES[save_data[`CharacterClass_${i}`]])


            this.players[i]["skill_max_levels"] = JSON.parse(save_data[`SM_${i}`]); // SM for max; SL and SLpre for currents
            this.players[i]["skill_current_levels"] = JSON.parse(save_data[`SL_${i}`]); // SM for max; SL and SLpre for currents




        }

        console.log(this.players)


        // let emptytabs_content = `<ul id="tabs-char-talents-nav" class="ui-tabs-nav ui-corner-all ui-helper-reset ui-helper-clearfix ui-widget-header"> </ul>`

        // document.getElementById("tabs-char-talents").innerHTML = emptytabs_content

        let tabs = $("#tabs-char-talents").tabs({});
        tabs.find("div").remove();
        tabs.find("li").remove();
        // document.getElementById("tabs-char-talents").tabs();
        // tabs.tabs("refresh");

        for (let i = 0; i < player_names.length; i++) {
            this.addPlayerDisplay(i)
        }

        this.makeTalentUpgradeList()

    }



    addPlayerDisplay(playerId) {
        let player = this.players[playerId]


        // add char tab
        let img = `<img src=${CLASS_ICONS[player.class_name]} class="collapsible_icon" />`
        let li = `<li><a href='#tab_char${playerId}'>${img}${player.name}</a> </li>`

        let subtabs_def = `<div id=tabs-subclass-char${playerId} class="jquerytabs"><ul></ul></div>`

        let tabs = $("#tabs-char-talents").tabs();
        tabs.find("#tabs-char-talents-nav").append(li);
        tabs.append(`<div id="tab_char${playerId}">` + subtabs_def + "</div>");
        tabs.tabs("refresh");
        tabs.tabs("option", "active", 0);




        for (let talent_page of player.subclasses) {
            let img = `<img src=${CLASS_ICONS[talent_page]} class="collapsible_icon" />`
            let nav = `<li><a href='#tab-char${playerId}-class-${talent_page}'>${img}${talent_page}</a> </li>`
            let content = ""
            content += `<div id="tab-char${playerId}-class-${talent_page}">`
            content += `<table>`
            content += `<tr>`
            let i = 0
            for (let talent of Object.entries(TALENTS[talent_page])) {

                if (i % 5 == 0) {
                    content += `</tr><tr>`
                }
                i++;
                // content += `${talent[0]} - ${player.skill_max_levels[talent[1].skillIndex]} `
                content += `<td>`
                content += this.getTalentDisplay(player, talent[1])
                content += `</td>`
            }
            content += `</tr>`
            content += `</table>`

            let subtabs = $(`#tabs-subclass-char${playerId}`).tabs();
            subtabs.find(".ui-tabs-nav").append(nav);
            subtabs.append(content);
            subtabs.tabs("refresh");
            subtabs.tabs("option", "active", 0);
        }



    }

    getTalentDisplay(player, talent) {
        let display = ""
        let icon = TALENT_ICONS[talent.name]
        let icon_display = icon ? `<img src=${icon}/>` : (talent.name)
        // let icon_display = icon ? `<img src=${icon}/>` : capEachWord(talent.name)
        let max_lvl = player.skill_max_levels[talent.skillIndex]
        let cur_lvl = player.skill_current_levels[talent.skillIndex]
        let display_class = (max_lvl == this.max_book_level) ? "completed" : ""
        display += `<div class="talent_display ${display_class}">${icon_display}<br> ${cur_lvl}/${max_lvl}</div>`
        return display
    }



    makeTalentUpgradeList() {
        let max_tier = TALENT_TIERS.length
        let tiered_talents = Array.from({ length: max_tier + 1 }, () => ([]));

        // iterate all players
        for (let playerId = 0; playerId < this.players.length; playerId++) {

            let player = this.players[playerId]

            // iterate all talents of the player
            for (let talent_page of player.subclasses) {
                for (let talent of Object.entries(TALENTS[talent_page])) {
                    let current_level = player.skill_max_levels[talent[1].skillIndex]
                    if (current_level < this.max_book_level) {
                        // iterate tiers and see if
                        let has_tier = false
                        for (let tier = 0; tier < max_tier; tier++) {
                            let talent_list = TALENT_TIERS[tier].list
                            // console.log(talent_list)
                            // console.log(talent[1].name)
                            if (talent_list.hasOwnProperty(talent[1].name)) {
                                has_tier = true
                                tiered_talents[tier].push({
                                    "char": playerId,
                                    "charname": player.name,
                                    "class": talent_page,
                                    "talent": talent[1].name,
                                    "level": current_level,
                                    "purpose": talent_list[talent[1].name]
                                })
                            }

                        }
                        if (!has_tier) {
                            tiered_talents[max_tier].push({
                                "char": playerId,
                                "charname": player.name,
                                "class": talent_page,
                                "talent": talent[1].name,
                                "level": current_level,
                                "purpose": "Bad or not yet added to a tier"
                            })
                        }
                    }

                }

            }

        }

        console.log(tiered_talents)


        // display results
        let tabs = $("#tabs-talents-by-tier").tabs();
        tabs.find("div").remove();
        tabs.find("li").remove();
        for (let tier = 0; tier < max_tier + 1; tier++) {


            if (tiered_talents[tier].length > 0) {
                // add tier tab
                let tier_name = tier < max_tier ? `Tier ${tier + 1}` : "No Tier"
                let li = `<li><a href='#tab_tier${tier}'>${tier_name}</a> </li>`

                let content = ""
                content += `${TALENT_TIERS[tier].purpose}`
                content += `<table class="tiered_talents">`
                content += `<tr>`
                content += `<th>Icon</th>`
                content += `<th>Talent</th>`
                content += `<th>Character</th>`
                content += `<th>Talent tab</th>`
                content += `<th>Purpose</th>`
                content += `<th>Max Level</th>`
                content += `</tr>`

                for (let upgrade of tiered_talents[tier]) {
                    content += `<tr>`
                    content += `<td>${(upgrade.talent)}</td>`
                    content += `<td>${capEachWord(upgrade.talent)}</td>`
                    content += `<td>${upgrade.charname} (n°${upgrade.char + 1})</td>`
                    content += `<td>${upgrade.class}</td>`
                    content += `<td>${upgrade.purpose}</td>`
                    content += `<td>${upgrade.level}/${this.max_book_level}</td>`
                    content += `</tr>`
                }

                content += `</table>`



                tabs.find("#tabs-talents-by-tier-nav").append(li);
                tabs.append(`<div id="tab_tier${tier}">` + content + "</div>");
                tabs.tabs("refresh");
                tabs.tabs("option", "active", 0);
            }

        }


    }
}



function capEachWord(name) {
    let words = name.split(/[_ ]/)
    let result = ""
    for (let word of words) {
        result += capitalizeFirstLetter(word.toLowerCase()) + " "
    }
    return result.slice(0, -1);
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}