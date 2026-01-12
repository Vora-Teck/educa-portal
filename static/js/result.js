function loadResult() {
    showLoader("loading Result...")

    let result = getQueryParams();
    //console.log(result)
    if(!result.type) {
        pushNotification('n_error', 'Invalid parameters', 5000);
        $("main").html(`<h3>Invalid parameters</h3>`)
        hideLoader()
        return;
    }
    if(result.type === "single") {
        if(!result.doc_id) {
            pushNotification('n_error', 'Result parameter not provided', 5000);
            $("main").html(`<h3>Result parameter not provided</h3>`)
            hideLoader()
            return;
        }
        let result_id = result.doc_id
        admin.result.studentResult({
            params: {result_id},
            onSuccess: (data) => {
                    //console.log(data)
                    if(data.status == "success") {
                        let r = data.result;
                        let school = data.school;
                        let class_average = data.class_average;
                        let user = r.student;
                        let scores = r.scores;
                        let term = r.term;
                        let classroom = r.classroom;

                        $('title').text(`${school.name} - Student Report Card`)
                        
                        let res_body = ``;
                        for(let sc in scores) {
                            let s = scores[sc]
                            let marks = s.marks;
                            let [exam_score, test_score] = [0, 0];
                            for (let i in marks) {
                                let m = marks[i];
                                if(m.exam.examType == 'exam') {exam_score += m.score}
                                else if(m.exam.examType == 'test') {test_score += m.score}
                                //console.log(marks[i])
                            }
                            let temp = `
                            <tr>
                                <td style="text-align:left;">${s.course.title}</td>
                                <td>${test_score}</td>
                                <td>${exam_score}</td>
                                <td>${s.total_score}</td>
                                <td>${s.total_score}</td>
                                <td>${s.grade || 'N/A'}</td>
                                <td style="text-align:left;">${s.remark.toUpperCase()}</td>
                            </tr>`;
                            res_body += temp
                        }

                        let header = `
                            <header>
                                <img class="school_logo" 
                                    src="${school.logo ? `${base_url}${school.logo}` : `/static/logos/logo.png`}" 
                                    alt="school_logo"
                                />
                                <div class="school-details">
                                    <h1 class="school_name">${school.name.toUpperCase()}</h1>
                                    <p class="address">${school.address.address}, ${school.address.lga} LGA, ${school.address.state} State, ${school.address.country}.</p>
                                    <p><b>Motto:</b> <span class="motto">${school.motto}</span></p>
                                    <p><b>Mobile:</b> ${school.phone_number} | <b>E-mail:</b> ${school.email}</p>
                                </div>
                            </header>`;

                        let student_info = `
                            <div class="student-info">
                                <table style="border:none;">
                                    <tr>
                                        
                                        <td rowspan="3" class="photo-placeholder">
                                            <img 
                                                class="user_img" 
                                                src="${user.image ? `${base_url}${user.image}` : `${base_url}${school.logo}`}" 
                                                style="width:100%;height:100%;" 
                                                alt="user_image"
                                            />
                                        </td>
                                        <td class="orange">Name: ${user.firstName} ${user.middleName} ${user.lastName}</td>
                                        <td class="orange">Session: ${term.session.title}</td>
                                        <td class="orange">Class: ${classroom.level.title}</td>
                                    </tr>
                                    <tr>
                                        <td class="orange">Admission No: ${user.studentId}</td>
                                        <td class="orange">Term: ${term.title}</td>
                                        <td class="orange">Position: ${r.position}</td>
                                    </tr>
                                    <tr>
                                        <td class="orange">No in Class: ${digify(classroom.data.total_students)}</td>
                                        <td class="orange">Date of Birth: ${datify(user.dateOfBirth)}</td>
                                        <td class="orange">Remark: ______________</td>
                                    </tr>
                                </table>
                            </div>`;
                        
                        let attendance = `
                            <div class="attendance-class">
                                <table>
                                    <tr>
                                        <td>No of Times School Opens: 112</td>
                                        <td>No of Times Present: 112</td>
                                        <td>Times Absent: 0</td>
                                    </tr>
                                </table>
                            </div>`;
                        
                        let main = `
                        
                            <div class="subjects-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th rowspan="2">SUBJECTS</th>
                                            <th>TEST</th>
                                            <th>EXAM</th>
                                            <th>TOTAL</th>
                                            <th>AVG.</th>
                                            <th>GRADE</th>
                                            <th>REMARKS</th>
                                        </tr>
                                        <tr>
                                            <th></th>
                                            <th></th>
                                            <th>(100)</th>
                                            <th>%</th>
                                            <th></th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody class="res_body">
                                        ${res_body}
                                    </tbody>
                                    <tfoot>
                                        <tr style="border:none !important">
                                            <td style="border:none !important" colspan="7"></td>
                                        </tr>
                                        <tr>
                                            <th colspan="2">TOTAL</th>
                                            <td id="total">${digify(r.total_score)}</td>
                                            <th colspan="2">Obtainable Marks</th>
                                            <td id="obtainable">${digify(r.total_score_obtainable)}</td>
                                            
                                        </tr>
                                        <tr>
                                            <th colspan="2">Percentage</th>
                                            <td id="average">${r.average_score}%</td>
                                            <th colspan="2">Class Average</th>
                                            <td id="class_avg">${class_average}%</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>`;
                        
                        let domain_table = `
                        <table>
                                    <tr>
                                        <th>Affective Domain</th>
                                        <th>3</th>
                                        <th>2</th>
                                        <th>1</th>
                                    </tr>
                                    <tr>
                                        <td>Cooperation</td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td>Leadership</td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td>Helping Others</td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td>Emotional Stability</td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td>Health</td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                </table>`;
                        
                        let punc_table = `
                        <table>
                                    <tr>
                                        <th></th>
                                        <th>3</th>
                                        <th>2</th>
                                        <th>1</th>
                                    </tr>
                                    <tr>
                                        <td>Punctuality</td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td>Neatness</td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td>Politeness</td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                </table>`;

                        let psycho_table = `
                        <table>
                                    <tr>
                                        <th>Psychomotor</th>
                                        <th>3</th>
                                        <th>2</th>
                                        <th>1</th>
                                    </tr>
                                    <tr>
                                        <td>Handwriting</td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td>Verbal Fluency</td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td>Game</td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td>Sport</td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td>Handling Tools</td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                </table>`;
                        
                        let comments = `
                        <div class="comments">
                            <table>
                                <tr>
                                    <th>Class Teacher's Comment:</th>
                                    <td style="min-width:250px;"></td>
                                    <th>Signature:</th>
                                    <td style="min-width:100px;"></td>
                                </tr>
                                <tr>
                                    <th>Principal's Comment:</th>
                                    <td></td>
                                    <th>Signature:</th>
                                    <td></td>
                                </tr>
                            </table>
                        </div>`;

                        let template = `
                        <section>
                            ${header}
                            ${student_info}
                            ${attendance}
                            <div class="main-content">
                                ${main}
                            
                                <div class="domains">
                                    <!-- Affective domain table -->
                                    ${domain_table}
                                    <!-- Punctuality Table -->
                                    ${punc_table}
                                    <!-- Psychomotor table -->
                                    ${psycho_table}
                    
                                </div>
                            </div>

                        ${comments}
                        </section>`;
                        $("main").html(template)
                    }
                    else {
                        pushNotification("n_error", data.message, 3000)
                        $("main").html(`<h3>${data.message}</h3>`)
                    }
                    hideLoader()
            },
            onError: (error) => {
                console.error(error)
                pushNotification("n_error", "Error occurred. Kindly check your internet connection", 3000)
                hideLoader()
            }
        })
    }
    else if(result.type === "bulk") {
        if(!result.class_id || !result.term_id) {
            pushNotification('n_error', 'Result parameter not provided', 5000);
            $("main").html(`<h3>Result parameter not provided</h3>`)
            hideLoader()
            return;
        }
        let class_id = result.class_id;
        let term_id = result.term_id;

        admin.result.classResult({
            params: {class_id, term_id},
            onSuccess: (data) => {
                //console.log(data)
                if(data.status == "success") {
                    
                    let school = data.school;
                    let class_average = data.class_average;
                    let res = data.results;
                    $("main").empty()
                    for(p in res) {
                        let r = res[p];
                        let user = r.student;
                        let scores = r.scores;
                        let term = r.term;
                        let classroom = r.classroom;

                        $('title').text(`${school.name} - Student Report Card`)
                        
                        let res_body = ``;
                        for(let sc in scores) {
                            let s = scores[sc]
                            let marks = s.marks;
                            let [exam_score, test_score] = [0, 0];
                            for (let i in marks) {
                                let m = marks[i];
                                if(m.exam.examType == 'exam') {exam_score += m.score}
                                else if(m.exam.examType == 'test') {test_score += m.score}
                                //console.log(marks[i])
                            }
                            let temp = `
                            <tr>
                                <td style="text-align:left;">${s.course.title}</td>
                                <td>${test_score}</td>
                                <td>${exam_score}</td>
                                <td>${s.total_score}</td>
                                <td>${s.total_score}</td>
                                <td>${s.grade || 'N/A'}</td>
                                <td style="text-align:left;">${s.remark.toUpperCase()}</td>
                            </tr>`;
                            res_body += temp
                        }

                        let header = `
                        <header>
                            <img class="school_logo" 
                                src="${school.logo ? `${base_url}${school.logo}` : `/static/logos/logo.png`}" 
                                alt="school_logo"
                            />
                            <div class="school-details">
                                <h1 class="school_name">${school.name.toUpperCase()}</h1>
                                <p class="address">${school.address.address}, ${school.address.lga} LGA, ${school.address.state} State, ${school.address.country}.</p>
                                <p><b>Motto:</b> <span class="motto">${school.motto}</span></p>
                                <p><b>Mobile:</b> ${school.phone_number} | <b>E-mail:</b> ${school.email}</p>
                            </div>
                        </header>`;

                        let student_info = `
                            <div class="student-info">
                                <table style="border:none;">
                                    <tr>
                                        
                                        <td rowspan="3" class="photo-placeholder">
                                            <img 
                                                class="user_img" 
                                                src="${user.image ? `${base_url}${user.image}` : `${base_url}${school.logo}`}" 
                                                style="width:100%;height:100%;" 
                                                alt="user_image"
                                            />
                                        </td>
                                        <td class="orange">Name: ${user.firstName} ${user.middleName} ${user.lastName}</td>
                                        <td class="orange">Session: ${term.session.title}</td>
                                        <td class="orange">Class: ${classroom.level.title}</td>
                                    </tr>
                                    <tr>
                                        <td class="orange">Admission No: ${user.studentId}</td>
                                        <td class="orange">Term: ${term.title}</td>
                                        <td class="orange">Position: ${r.position}</td>
                                    </tr>
                                    <tr>
                                        <td class="orange">No in Class: ${digify(classroom.data.total_students)}</td>
                                        <td class="orange">Date of Birth: ${datify(user.dateOfBirth)}</td>
                                        <td class="orange">Remark: ______________</td>
                                    </tr>
                                </table>
                            </div>`;
                        
                        let attendance = `
                            <div class="attendance-class">
                                <table>
                                    <tr>
                                        <td>No of Times School Opens: 112</td>
                                        <td>No of Times Present: 112</td>
                                        <td>Times Absent: 0</td>
                                    </tr>
                                </table>
                            </div>`;
                        
                        let main = `
                        
                            <div class="subjects-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th rowspan="2">SUBJECTS</th>
                                            <th>TEST</th>
                                            <th>EXAM</th>
                                            <th>TOTAL</th>
                                            <th>AVG.</th>
                                            <th>GRADE</th>
                                            <th>REMARKS</th>
                                        </tr>
                                        <tr>
                                            <th></th>
                                            <th></th>
                                            <th>(100)</th>
                                            <th>%</th>
                                            <th></th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody class="res_body">
                                        ${res_body}
                                    </tbody>
                                    <tfoot>
                                        <tr style="border:none !important">
                                            <td style="border:none !important" colspan="7"></td>
                                        </tr>
                                        <tr>
                                            <th colspan="2">TOTAL</th>
                                            <td id="total">${digify(r.total_score)}</td>
                                            <th colspan="2">Obtainable Marks</th>
                                            <td id="obtainable">${digify(r.total_score_obtainable)}</td>
                                            
                                        </tr>
                                        <tr>
                                            <th colspan="2">Percentage</th>
                                            <td id="average">${r.average_score}%</td>
                                            <th colspan="2">Class Average</th>
                                            <td id="class_avg">${class_average}%</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>`;
                        
                        let domain_table = `
                        <table>
                                    <tr>
                                        <th>Affective Domain</th>
                                        <th>3</th>
                                        <th>2</th>
                                        <th>1</th>
                                    </tr>
                                    <tr>
                                        <td>Cooperation</td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td>Leadership</td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td>Helping Others</td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td>Emotional Stability</td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td>Health</td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                </table>`;
                        
                        let punc_table = `
                        <table>
                                    <tr>
                                        <th></th>
                                        <th>3</th>
                                        <th>2</th>
                                        <th>1</th>
                                    </tr>
                                    <tr>
                                        <td>Punctuality</td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td>Neatness</td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td>Politeness</td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                </table>`;

                        let psycho_table = `
                        <table>
                                    <tr>
                                        <th>Psychomotor</th>
                                        <th>3</th>
                                        <th>2</th>
                                        <th>1</th>
                                    </tr>
                                    <tr>
                                        <td>Handwriting</td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td>Verbal Fluency</td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td>Game</td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td>Sport</td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td>Handling Tools</td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                </table>`;
                        
                        let comments = `
                        <div class="comments">
                            <table>
                                <tr>
                                    <th>Class Teacher's Comment:</th>
                                    <td style="min-width:250px;"></td>
                                    <th>Signature:</th>
                                    <td style="min-width:100px;"></td>
                                </tr>
                                <tr>
                                    <th>Principal's Comment:</th>
                                    <td></td>
                                    <th>Signature:</th>
                                    <td></td>
                                </tr>
                            </table>
                        </div>`;

                        let template = `
                        <section>
                            ${header}
                            ${student_info}
                            ${attendance}
                            <div class="main-content">
                                ${main}
                            
                                <div class="domains">
                                    <!-- Affective domain table -->
                                    ${domain_table}
                                    <!-- Punctuality Table -->
                                    ${punc_table}
                                    <!-- Psychomotor table -->
                                    ${psycho_table}
                    
                                </div>
                            </div>

                        ${comments}
                        </section>`;
                        $("main").append(template)
                        $("main").append(`<div style='page-break-after: always'></div>`)
                    }
                }
                else {
                    pushNotification("n_error", data.message, 3000)
                    $("main").html(`<h3>${data.message}</h3>`)
                }
                hideLoader()
            },
            onError: (error) => {
                console.error(error)
                pushNotification("n_error", "Error occurred. Kindly check your internet connection", 3000)
                hideLoader()
            }
        })
    }
    else {
        pushNotification('n_error', 'Invalid parameters', 5000);
        $("main").html(`<h3>Invalid parameters</h3>`)
        hideLoader()
        return;
    }
}

loadResult()

$(".download-btn").on('click', function() {
    window.print()
})