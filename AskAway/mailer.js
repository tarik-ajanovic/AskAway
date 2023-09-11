const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    pool: true,
    service: "hotmail",
    auth: {
        user: "askawayplatform@outlook.com",
        pass: "Doitlikeaa#36"
    }
});

function sendConformationMail(user, title, date, code){
    let email = user.email;
    let start_date = date.toLocaleString("en-GB", {year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' });
    const options = {
        from: "askawayplatform@outlook.com",
        to: email,
        subject: "Presentation Scheduled Successfully | AskAway",
        text: `Hello ${user.first_name} ${user.last_name}, \n 
        your presentation ${title} happening on ${start_date} has successfully been scheduled! \n
        The presentation code is: ${code}`
    };

    transporter.sendMail(options, function (err, info){
        if (err) {
            console.log(err);
            return;
        }
        console.log("Sent: "+ info.response);
    })
}

async function sendInvitationMail(mailingList, title, date, code) {
    let start_date = date.toLocaleString("en-GB", {year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })
    mailingList = mailingList.replace(/ /g, '');
    let mailingListArray = mailingList.split(",");
    console.log(mailingListArray);

    for (let i = 0; i < mailingListArray.length; i++){
        const options = {
            from: "askawayplatform@outlook.com",
            to: mailingListArray[i],
            subject: "Presentation Scheduled Successfully | AskAway",
            text: `Greetings, \n 
        you have been invited to attend an AskAway presentation ${title} happening on ${start_date} has successfully been scheduled! \n
        The presentation access code is: ${code}. See you there!`
        };
        await transporter.sendMail(options, function (err, info){
            if (err) {
                console.log(err);
                return;
            }
            console.log("Sent: "+ info.response);
        })
    }
}

module.exports = {sendConformationMail, sendInvitationMail};