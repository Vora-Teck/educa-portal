$("main").empty()
function loadSpreadsheet() {
    showLoader("loading Result...")
    let params = getQueryParams();

    if(!params.session_id) {
        pushNotification('n_error', 'Invalid parameters', 5000);
        $("main").html(`<h3>Invalid parameters</h3>`)
        hideLoader()
        return;
    }

    admin.result.getSpreadsheet({
        params: {session_id: params.session_id},
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                let school = data.school;
                let session = data.session;
                let sheets = data.sheets;

                $('title').text(`${school.name} - Spreadsheet`)

                let sheet_map = 0;
                
                let nav_temp = `
                <ul class="nav nav-tabs">
                  ${sheets.map(function(item) {
                    sheet_map += 1;
                    return `<li class="nav-item">
                    <a class="nav-link ${sheet_map == 1 ? `active` : ``}" data-toggle="tab" href="#menu${sheet_map}">${item.name}</a>
                    </li>`
                  }).join('')}
                </ul>`;

                let sheet_temp = ``;

                for(let s in sheets) {
                    let sh = sheets[s];

                    let sh_headers = ``;
                    let sh_rows = ``;
                    for(let h in sh.headers) {
                        let he = sh.headers[h];
                        let tmp = `
                        <tr>
                            ${he.map(function(cell) {
                                return `
                                    <th
                                        ${cell.colspan > 1 ? `colspan="${cell.colspan}"` : ``} 
                                        ${cell.rowspan > 1 ? `rowspan="${cell.rowspan}"` : ``} 
                                        >${cell.value || ''}</th>`
                            }).join('')}
                        </tr>`;

                        sh_headers += tmp
                    }

                    for(let r in sh.rows) {
                        let ro = sh.rows[r];
                        let tmp = `
                        <tr>
                            ${ro.map(function(val) {
                                return `
                                    <td>${val === null ? "N/A" : val}</td>`
                            }).join('')}
                        </tr>`;

                        sh_rows += tmp
                    }

                    let temp = `
                    <div class="tab-pane ${Number(s) + 1 == 1 ? `active` : ``} container" id="menu${(Number(s) + 1).toString()}">
                        <h3 class="sheet-title">${sh.name}</h3>

                        <div class="table-responsive">
                            <table class="table table-bordered">
                            <thead class="thead-dark">
                                ${sh_headers}
                            </thead>
                        
                            <tbody>
                                ${sh_rows}
                            </tbody>
                            </table>
                        </div>
                    </div>`;

                    sheet_temp += temp;
                }

                let template = `
                <img 
                src="${school.logo ? `${school.logo}` : `/static/logos/logo.png`}" 
                alt="" />
                <h2>Broadsheet Result Data for ${session.title}</h2>

                ${nav_temp}
                <div class="tab-content">
                    ${sheet_temp}
                </div>
                `;

                $("main").html(template)
            }
            else {
                $("main").html(`<h3>${data.message}</h3>`)
                pushNotification("n_error", data.message, 3000)
            }
            hideLoader()
        },
        onError: (error) => {
            //console.error(error);
            pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
            hideLoader()
        }
    })
}

loadSpreadsheet()