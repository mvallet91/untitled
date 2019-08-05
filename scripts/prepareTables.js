import {sqlInsert} from "./databaseHelpers.js";
import {loader} from "./helpers.js";


/**
 * Handles the 3 main tables that are displayed on the ELAT dashboard
 * @param connection Main JsStore worker that handles the connection to SqlWeb
 */
export function prepareTables(connection){
    showCourseTable(connection);
    showDetailsTable(connection);
    showMainIndicatorsTable(connection);
}

/**
 * Function to generate, or obtain the data from the database if available, and display it on the Course Details table
 * @param connection Main JsStore worker that handles the connection to SqlWeb
 */
function showCourseTable(connection) {
    let HtmlString = "";
    connection.runSql("SELECT * FROM webdata WHERE name = 'courseDetails' ").then(function(result) {
        if (result.length === 1) {
            HtmlString = result[0]['object']['details'];
            document.getElementById("loading").style.display = "none";
            $('#tblGrid tbody').html(HtmlString);
        } else {
            loader(true);
            connection.runSql('select * from courses').then(function (courses) {
                let questionCounter = 0;
                let forumInteractionCounter = 0;
                let dateFormat = {weekday: 'short', year: 'numeric', month: 'long', day: 'numeric'};
                courses.forEach(async function (course) {
                    HtmlString += "<tr ItemId=" + course.course_id + "><td>" +
                        course.course_name + "</td><td>" +
                        course.start_time.toLocaleDateString('en-EN', dateFormat) + "</td><td>" +
                        course.end_time.toLocaleDateString('en-EN', dateFormat) + "</td><td>";
                    let query = "count from course_elements where course_id = '" + course.course_id + "'";
                    await connection.runSql(query).then(function (result) {
                        HtmlString += result.toLocaleString('en-US') + "</td><td>";
                    });
                    query = "count from learner_index where course_id = '" + course.course_id + "'";
                    await connection.runSql(query).then(function (result) {
                        HtmlString += result.toLocaleString('en-US') + "</td><td>";
                    });
                    query = "SELECT * FROM quiz_questions";
                    await connection.runSql(query).then(function (results) {
                        results.forEach(function (result) {
                            if (result['question_id'].includes(course.course_id.slice(10,))) {
                                questionCounter++;
                            }
                        });
                        HtmlString += questionCounter.toLocaleString('en-US') + "</td><td>";
                    });
                    query = "SELECT * FROM forum_interaction";
                    await connection.runSql(query).then(function (sessions) {
                        sessions.forEach(function (session) {
                            if (session['course_learner_id'].includes(course.course_id)) {
                                forumInteractionCounter++;
                            }
                        });
                    });
                    HtmlString += forumInteractionCounter.toLocaleString('en-US');
                    $('#tblGrid tbody').html(HtmlString);
                    let courseDetails = [{'name': 'courseDetails', 'object': {'details': HtmlString}}];
                    sqlInsert('webdata', courseDetails, connection);
                    loader(false);
                })
            }).catch(function (error) {
                console.log(error);
                loader(false)
            })
        }
    })
}

/**
 * Function to generate, or obtain the data from the database if available, and display it on the Database Details table
 * @param connection Main JsStore worker that handles the connection to SqlWeb
 */
function showDetailsTable(connection) {
    let HtmlString = "";
    let totalHtmlString = "";
    connection.runSql("SELECT * FROM webdata WHERE name = 'databaseDetails' ").then(function(result) {
        if (result.length === 1) {
            HtmlString = result[0]['object']['details'];
            document.getElementById("loading").style.display = "none";
            $('#dbGrid tbody').html(HtmlString);
        } else {
            loader(true);
            connection.runSql('select * from courses').then(function (courses) {
                courses.forEach(async function (course) {
                    let totalSessionCounter = 0;
                    let totalForumSessionCounter = 0;
                    let totalVideoInteractionCounter = 0;
                    let totalSubmissionCounter = 0;
                    let totalAssessmentCounter = 0;
                    let totalQuizSessionCounter = 0;
                    let sessionCounter = 0;
                    let forumSessionCounter = 0;
                    let videoInteractionCounter = 0;
                    let submissionCounter = 0;
                    let assessmentCounter = 0;
                    let quizSessionCounter = 0;
                    totalHtmlString += "<tr ItemId=" + 'total' + "><td>" +
                        "Total" + "</td><td>";
                    HtmlString += "<tr ItemId=" + course.course_id + "><td>" +
                        course.course_name + "</td><td>";
                    let query = "SELECT * FROM sessions";
                    await connection.runSql(query).then(function (sessions) {
                        sessions.forEach(function (session) {
                            totalSessionCounter++;
                            if (session['course_learner_id'].includes(course.course_id)) {
                                sessionCounter++;
                            }
                        });
                    });
                    query = "SELECT * FROM forum_sessions";
                    await connection.runSql(query).then(function (sessions) {
                        sessions.forEach(function (session) {
                            totalForumSessionCounter++;
                            if (session['course_learner_id'].includes(course.course_id)) {
                                forumSessionCounter++;
                            }
                        });
                    });
                    query = "SELECT * FROM video_interaction";
                    await connection.runSql(query).then(function (sessions) {
                        sessions.forEach(function (session) {
                            totalVideoInteractionCounter++;
                            if (session['course_learner_id'].includes(course.course_id)) {
                                videoInteractionCounter++;
                            }
                        });
                    });
                    query = "SELECT * FROM submissions";
                    await connection.runSql(query).then(function (sessions) {
                        sessions.forEach(function (session) {
                            totalSubmissionCounter++;
                            if (session['course_learner_id'].includes(course.course_id)) {
                                submissionCounter++;
                            }
                        });
                    });
                    query = "SELECT * FROM assessments";
                    await connection.runSql(query).then(function (sessions) {
                        sessions.forEach(function (session) {
                            totalAssessmentCounter++;
                            if (session['course_learner_id'].includes(course.course_id)) {
                                assessmentCounter++;
                            }
                        });
                    });
                    query = "SELECT * FROM quiz_sessions";
                    await connection.runSql(query).then(function (sessions) {
                        sessions.forEach(function (session) {
                            totalQuizSessionCounter++;
                            if (session['course_learner_id'].includes(course.course_id)) {
                                quizSessionCounter++;
                            }
                        });
                    });
                    totalHtmlString += totalSessionCounter.toLocaleString('en-US') + "</td><td>" +
                        totalForumSessionCounter.toLocaleString('en-US') + "</td><td>" +
                        totalVideoInteractionCounter.toLocaleString('en-US') + "</td><td>" +
                        totalSubmissionCounter.toLocaleString('en-US') + "</td><td>" +
                        totalAssessmentCounter.toLocaleString('en-US') + "</td><td>" +
                        totalQuizSessionCounter.toLocaleString('en-US');
                    HtmlString += sessionCounter.toLocaleString('en-US') + "</td><td>" +
                        forumSessionCounter.toLocaleString('en-US') + "</td><td>" +
                        videoInteractionCounter.toLocaleString('en-US') + "</td><td>" +
                        submissionCounter.toLocaleString('en-US') + "</td><td>" +
                        assessmentCounter.toLocaleString('en-US') + "</td><td>" +
                        quizSessionCounter.toLocaleString('en-US');
                    document.getElementById("loading").style.display = "none";
                    $('#dbGrid tbody').html(HtmlString);
                    let databaseDetails = [{'name': 'databaseDetails', 'object': {'details':HtmlString}}];
                    sqlInsert('webdata', databaseDetails, connection);
                    loader(false)
                });
            }).catch(function (error) {
                console.log(error);
            });
        }
    })
}

/**
 * Function to generate, or obtain the data from the database if available, and display it on the Main Indicators table
 * @param connection Main JsStore worker that handles the connection to SqlWeb
 */
function showMainIndicatorsTable(connection) {
    let HtmlString = "";
    connection.runSql("SELECT * FROM webdata WHERE name = 'mainIndicators' ").then(function(result) {
        if (result.length === 1) {
            HtmlString = result[0]['object']['details'];
            $('#indicatorGrid tbody').html(HtmlString);
        } else {
            loader(true);
            connection.runSql('select * from courses').then(function (courses) {
                courses.forEach(async function (course) {
                    let course_id = course.course_id,
                        completed = 0,
                        completionRate = 0,
                        avgGrade = 0,
                        verifiedLearners = 0,
                        honorLearners = 0,
                        auditLearners = 0,
                        videoWatchers = 0,
                        videoDuration = 0,
                        avgGrades = {};

                    HtmlString += "<tr ItemId=" + course_id + "><td>";
                    await connection.runSql("COUNT * from course_learner WHERE certificate_status = 'downloadable' ").then(function (result) {
                        completed = result;
                    });
                    await connection.runSql("COUNT * from learner_index").then(function (result) {
                        completionRate = completed / result;
                    });
                    await connection.runSql("SELECT [avg(final_grade)] from course_learner WHERE certificate_status = 'downloadable' ").then(function (result) {
                        avgGrade = result[0]['avg(final_grade)'] * 100;
                    });
                    await connection.runSql("COUNT * from course_learner WHERE enrollment_mode = 'verified' ").then(function (result) {
                        verifiedLearners = result;
                    });
                    await connection.runSql("COUNT * from course_learner WHERE enrollment_mode = 'honor' ").then(function (result) {
                        honorLearners = result;
                    });
                    await connection.runSql("COUNT * from course_learner WHERE enrollment_mode = 'audit' ").then(function (result) {
                        auditLearners = result;
                    });
                    await connection.runSql("SELECT [avg(final_grade)] from course_learner WHERE certificate_status = 'downloadable' GROUP BY enrollment_mode").then(function (results) {
                        results.forEach(function (result) {
                            avgGrades[result.enrollment_mode] = result.final_grade * 100;
                        });
                    });
                    await connection.runSql("SELECT [sum(duration)] from video_interaction GROUP BY course_learner_id").then(function (watchers) {
                        videoWatchers = watchers.length;
                        videoDuration = 0;
                        watchers.forEach(function (watcher) {
                            videoDuration += watcher['sum(duration)'];
                        });
                    });
                    let avgDuration = videoDuration / videoWatchers;
                    HtmlString += completionRate.toFixed(2).toLocaleString('en-US')  + "</td><td>" +
                        avgGrade.toFixed(2).toLocaleString('en-US')  + "</td><td>" +
                        "Verified: " + verifiedLearners.toLocaleString('en-US') + "<br>" +
                        "Honor: " + honorLearners.toLocaleString('en-US') + "<br>" +
                        "Audit: " + auditLearners.toLocaleString('en-US') + "<br>" +
                        "</td><td>" +
                        "Verified: " + avgGrades['verified'] + "<br>" +
                        "Honor: " + avgGrades['honor'] + "<br>" +
                        "Audit: " + avgGrades['audit'] + "<br>" +
                        "</td><td>" +
                        (avgDuration/60).toFixed(2).toLocaleString('en-US') + " minutes" + "</td><td>" +
                        videoWatchers.toLocaleString('en-US');
                    $('#indicatorGrid tbody').html(HtmlString);
                    let indicators = [{'name': 'mainIndicators', 'object': {'details': HtmlString}}];
                    sqlInsert('webdata', indicators, connection);
                    loader(false)
                });
            }).catch(function (error) {
                console.log(error);
                loader(false)
            });
        }
    })
}
