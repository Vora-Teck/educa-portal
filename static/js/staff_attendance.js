var months = {1: "January", 2: "February", 3: "March", 4: "April", 5: "May", 6: "June", 7: "July", 8: "August", 9: "September", 10: "October", 11: "November", 12: "December"}
var terms = {1: "First Term", 2: "Second Term", 3: "Third Term", 4: "Fourth Term", 5: "Fifth Term"}


showLoader("Loading Data...")


async function setTerm() {
    let data = JSON.parse(sessionStorage.eduka_attendance_data)
    var session = $("#session-filter").val();
    var session_data = data[session]
    $("#term-filter").empty()
    for(let t in session_data) {
        var temp = `<option value="${t}" selected>${terms[t]}</option>`
        $("#term-filter").prepend(temp)
        await setWeek()
    }
    await getAttendance()
}
async function setWeek() {
    let data = JSON.parse(sessionStorage.eduka_attendance_data)
    var session = $("#session-filter").val();
    var term = $("#term-filter").val();
    var term_data = data[session][term]
    $("#week-filter").empty()
    for(let w in term_data) {
        var temp = `<option value="${w}" selected>${w}</option>`
        $("#week-filter").prepend(temp)
    }
}


async function getData() {
    $("#session-filter").empty()
    admin.attendance.getData({
        onSuccess: (data) => {
                //console.log(data);
                if(data.status == 'success') {
                    let d = data.data
                    for(let s in d) {
                        var temp = `<option value="${s}">${s}</option>`
                        $("#session-filter").append(temp)
                    }
                    sessionStorage.setItem("eduka_attendance_data", JSON.stringify(d))
                    setTerm()
                }
                else {
                    pushNotification("n_error", data.message, 3000)
                    hideLoader()
                }
            hideLoader()
        },
        onError: (error) => {
                console.error(error);
                pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
                hideLoader()
        }
  })
}

getData()

/* =========== Attendance Section =============== */
async function getAttendance() {
    let session = $("#session-filter").val()
    let week = $("#week-filter").val()
    let term = $("#term-filter").val()


    $('.att-list').empty()
    loader = `<tr>
        <td colspan="8" class="">
        <i class="fa fa-spinner rotate"></i>&nbsp;&nbsp;&nbsp;Processing...
        </td>
    </tr>`;
    $('.att-list').append(loader)

    let params = {session, week, term}

    //console.log(params)

    admin.attendance.getStaffAttendance({
        params: params,
        onSuccess: (data) => {
                //console.log(data);
                $('.att-list').empty()
                if(data.status == 'success') {
                    if(data.data) {
                        let e = data.data;
                        let end_d = new Date(e.end_date)
                        end_d.setDate(end_d.getDate() - 2)
                        $(".att-dates").html(`${datify(e.start_date, false)} - ${datify(end_d, false)}`)
                        let a_data = e.data

                        info = ``;

                        for(let i in a_data) {
                            att_data = a_data[i].attendance
                            att_d = ``
                            for(let p = 0; p < att_data.length; p++) {
                                var values = Object.values(att_data[p])
                                var dts = values[0]
                                mor = ``;
                                aft = ``;
                                if(dts.length > 0) {
                                    morn = dts[0]
                                    mor = morn ? `<i class="w-text-green fa fa-check-circle"></i>` : `<i class="w-text-red fa fa-times-circle"></i>`;
                                }
                                if(dts.length > 1) {
                                    afte = dts[1]
                                    aft = afte ? `&nbsp;&nbsp;<i class="w-text-green fa fa-check-circle"></i>` : `&nbsp;&nbsp;<i class="w-text-red fa fa-times-circle"></i>`;
                                }
                                att_d += `<td style="text-align:left;font-size:18px;">${mor}${aft}</td>`
                            }
                            let temp = `
                            <tr class="att-row" data-name="${a_data[i].name.toLowerCase()} ${a_data[i].staffId.toLowerCase()}">
                                <td>
                                    <img src="${a_data[i].image ? `${base_url}${a_data[i].image}` : "/static/image/avatar.png"}"
                                    alt="" 
                                    style="width:45px;height:45px;border-radius:50%;" />
                                </td>
                                <td>${a_data[i].name}</td>
                                <td>${a_data[i].staffId}</td>
                                ${att_d}
                            </tr>`;

                            $('.att-list').append(temp)
                        }
                    }
                    else {
                        let temp = `<tr>
                        <td colspan="8" class="w-text-gray w-italic">${data.message}</td>
                        </tr>`;
                        $('.att-list').append(temp)
                    }
                }
                else {
                    pushNotification("n_error", data.message, 3000);
                    let temp = `<tr>
                        <td colspan="8" class="w-text-gray w-italic">${data['message']}</td>
                        </tr>`;
                        $('.att-list').append(temp)
                }
                hideLoader()
        },
        onError: (error) => {
            console.error(error);
            $('.att-list').empty()
            pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
            hideLoader()
        }
  })
}

function getTodayAttendance() {
    showLoader("Fetching attendance...")
    $(".curr-att-list").empty()
    admin.attendance.getCurrentStaffAttendance({
            onSuccess: (data) => {
                //console.log(data)
                if(data.status == 'success') {
                    let e = data.data;

                    var std_ids = []

                    for(let i in e) {
                        var att = e[i].attendance;
                        std_ids.push(e[i].staffId)
                        var morning = ``;
                        var afternoon = ``;
                        if(att.length === 1 && att[0] === null) {
                            morning = ""
                            afternoon = ""
                        }
                        if(att.length === 1 && att[0] === true) {
                            morning = "checked"
                            afternoon = ""
                        }
                        else if(att.length === 2) {
                            morning = att[0] === true ? "checked" : "";
                            afternoon = att[1] === true ? "checked" : "";
                        }
                
                        let temp = `
                        <tr>
                            <td>
                                <img src="${e[i].image ? `${base_url}${e[i].image}` : "/static/image/avatar.png"}"
                                alt="" 
                                style="width:45px;height:45px;border-radius:50%;" />
                            </td>
                            <td>${e[i].name}</td>
                            <td>${e[i].staffId}</td>
                            <td>
                                <label class="switch">
                                    <input type="checkbox" class="switch-box" ${morning}  name="${e[i].staffId}">
                                    <span class="switch-slider"></span>
                                </label>
                            </td>
                            <td>
                                <label class="switch">
                                    <input type="checkbox" class="switch-box" ${afternoon}  name="${e[i].staffId}">
                                    <span class="switch-slider"></span>
                                </label>
                            </td>
                        </tr>`
                        $(".curr-att-list").append(temp)
                    }
                    
                    std_ids = std_ids.join(",")
                    $(".mark-att-form").data('name', std_ids)
                    $(".curr-date").html(datify())
                    $(".mark-att-con").addClass('active');
                }
                else {
                    pushNotification('n_error', data.message, 3000)
                }
                hideLoader()
            },
            onError: (error) => {
                console.error(error)
                pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
                hideLoader()
            }
    })
}

function markAttendance() {

    var profile_ids = $(".mark-att-form").data('name');
    profile_ids = profile_ids.split(",")
    var data = {}
    for(let i  = 0; i < profile_ids.length; i++) {
        var checked_status = [];
        $(`input[name='${profile_ids[i]}']`).each(function() {
            checked_status.push($(this).is(":checked"));
        })
        data[profile_ids[i]] = checked_status;
    }

    let formData = { data }

    //console.log(formData)

    showLoader("Updating attendance...")
    admin.attendance.markStaffAttendance({
        formData: formData,
            onSuccess: (data) => {
                if(data.status == 'success') {
                    pushNotification('n_success', data.message, 3000)
                }
                else {
                    pushNotification('n_error', data.message, 3000)
                }
                hideLoader()
                //getData()
                getAttendance()
            },
            onError: (error) => {
                console.error(error)
                pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
                hideLoader()
            }
    })
}

function getAnalysis() {
    $(".insight-side-con").addClass('active')
}



// ========== Event Listeners ======================
$(".mark-att-btn").click(function(e) {e.preventDefault();getTodayAttendance()})
$(".insight-btn").click(function(e) {e.preventDefault();getAnalysis()})


$(".mark-att-form").on('submit', function(e) {e.preventDefault();markAttendance()})
