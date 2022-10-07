const Patient = require('./patient.model')
const PatientHospital = require('../../hospital/hospital-patients/patient.model')

const Counter = require('./counter.model')
const mongoose = require('mongoose');
const Facilitator = require('../facilitator-register/facilitator.model')
const HospitalUser = require('../../hospital/hospital-auth/auth.model')

const Request = require('../opinion-request/request.model')
const Received = require('../opinion-request/received.model')
const Receivededit = require('../opinion-request/receivededited.model')
const Hospitalopinion = require('../opinion-request/hospital-opinion.model')
const Doctoropinion = require('../opinion-request/doctoropinion.model')
const Sentopinion = require('../opinion-request/sentopinion.model')
const Responsevil = require('../request-vil/responsevil.model')
const Sentvil = require('../request-vil/sentvil.model')
const Pdfmaking = require('../pdf-making/pdf.model')
const Preintimation = require('../pre-intimation/intimation.model')
const Opdrequest = require('../opd/opd.model')

const OpdRequestHospital = require('../../hospital/hospital-patients/opdassign.model')

const Opdresponse = require('../opd/opdresponse.model')
const Opdsent = require('../opd/sendopd.model')
const Status = require('./patient.status')
var json2xls = require('json2xls');
const Doctorcms = require('./cms.doctor.model')
const Doctorimg = require('./cms.doctorimg.model')

const Confirmation = require('../patient-confirmation/confirmation.model')
const ConfirmationHospital = require('../../hospital/hospital-conf/conf.model')

const Vil = require('../request-vil/requestvil.model')
const VilHospital = require('../../hospital/hospital-vil/vil.model')

const Company = require('../company-details/company.model')
const Branchcompany = require('../company-details/branch.model')
const Profoma = require('../Proforma Invoice/pi.model')
const Piresponse = require('../Proforma Invoice/pi.response.model')
const Pisent = require('../Proforma Invoice/sentpi.model')

const { AWSTranslateJSON } = require('aws-translate-json');
const Conv = require('./language')
const { ObjectId } = require('mongodb');
var sendemail = require('../send-email/sendemail');
var aws = require('aws-sdk')
var express = require('express')
var multer = require('multer')
var multerS3 = require('multer-s3')
const jwt_decode = require('jwt-decode');
const Zoho = require('../zoho-subscription/model');
const axios = require('axios');

aws.config.region = process.env.AWS_TRANSLATE_REGION
aws.config.credentials = new aws.Credentials(process.env.AWS_TRANSLATE_ID, process.env.AWS_TRANSLATE_SECRET)

const s3 = new aws.S3({
    accessKeyId: process.env.ACCESSKEYID,
    secretAccessKey: process.env.SECERETACCESSKEY,
    region: process.env.REGION,
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {

        cb(null, 'images')
    } else if (file.mimetype === 'application/pdf' || "application/msword" || 'application/vnd.ms-excel') {
        cb(null, 'files')
    } else {
        cb({ error: 'Mime type not supported' })
    }
}

const upload = multer({
    storage: multerS3({
        s3: s3,
        acl: 'public-read',
        bucket: process.env.BUCKETNAME,
        contentType: multerS3.AUTO_CONTENT_TYPE,

        metadata: (req, file, callBack) => {
            callBack(null, { fieldName: file.fieldname })
        },
        key: function(req, file, cb) {
            cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname)
        }
    }),
    fileFilter: fileFilter

})
const translateservice = new aws.Translate()
const getTranslation = async(msg, d, s) => {
    const params = {
        Text: msg,
        SourceLanguageCode: s,
        TargetLanguageCode: d
    }
    const trans = await translateservice.translateText(params, (err, data) => {
        console.log(data)
    })
    return trans
}

const removeMd = require('remove-markdown');
const { decode } = require('jsonwebtoken');

module.exports.upload = (upload.array('patientProfile')), (request, response, next) => {

    next();
}
exports.postPatient = async(req, res, next) => {
    try {
        const role = JSON.parse(req.body.role)
        const refferalpartner = JSON.parse(req.body.refferalpartner)
        const { userid } = req.params;
        const patient = new Patient();
        patient.name = req.body.name;
        patient.gender = req.body.gender;
        patient.country = req.body.country;
        patient.uhidcode = req.body.uhidcode;
        patient.age = req.body.age;
        patient.ageduration = req.body.ageduration;
        patient.passportNumber = req.body.passportNumber;

        patient.contact = req.body.contact;
        patient.source = req.body.source;
        patient.emailid = req.body.emailid;
        patient.treatment = req.body.treatment;

        patient.role = role;
        if (req.body.branchoffice == "" || req.body.branchoffice == "undefined") {
            patient.branchoffice = 'NAN';

        } else {
            patient.branchoffice = req.body.branchoffice;

        }
        if (req.body.employee == "" || req.body.employee == "undefined") {
            patient.employee = 'NAN';

        } else {
            patient.employee = req.body.employee;

        }
        if (req.body.refferalpartner == "{}") {
            patient.refferalpartner = 'NAN';

        } else {
            patient.refferalpartner = refferalpartner;

        }
        patient.companyname = req.body.companyname;
        patient.medicalhistory = req.body.medicalhistory;
        patient.remarks = req.body.remarks;

        if (req.files !== undefined) {
            for (let i = 0; i < req.files.length; i++) {
                patient.patientProfile[i] = req.files[i];

            }

        }
        const user = await Facilitator.findById(userid)
        const count = await Counter.find({ user: userid })
        if (!count.length) {
            const counter = new Counter()
            counter.user = userid
            await counter.save()
            patient.mhid = counter.seq

        } else {
            value = await Counter.findByIdAndUpdate(count[0]._id, { $inc: { seq: 1 } }, { new: true })
            patient.mhid = value.seq

        }
        patient.user = user


        await patient.save()
        sendemail.patientadmin(patient, user, req)

        user.patients.push(patient)
        await user.save()

        res.status(201).send({ message: "success", patientid: patient._id })
    } catch (err) {
        next(err);
    }
}

exports.patientEstimation = async(req, res, next) => {
    try {
        const awsConfig = {
            accessKeyId: process.env.AWS_TRANSLATE_ID,
            secretAccessKey: process.env.AWS_TRANSLATE_SECRET,
            region: process.env.AWS_TRANSLATE_REGION,
        }
        ccsend = []
        emailcc = req.body[0].emailcc
        emailcc.forEach(element => {
            ccsend.push(element.emailcc)
        });

        const source = "en";
        lang = req.body[0].language
        const taget = [lang];
        const { userid } = req.params;
        const { patientid } = req.params;
        const sentopinion = new Sentopinion();
        sentopinion.sentopinions = req.body
        const user = await Facilitator.findById(userid)
        const patient = await Patient.findById(patientid)
        qry1 = req.body

        sentopinion.user = user
        await sentopinion.save()
        sentopinion.patient = patient

        await sentopinion.save()

        user.sentopinions.push(sentopinion)
        await user.save()

        patient.sentopinions.push(sentopinion)
        patient.currentstatus = Status.opinionsent

        await patient.save()

        var patientest = req.body
        var id = userid

        zoneQuery = { "user": id };
        var companydetails = await Company.find(zoneQuery)

        var company = companydetails[0]
        var doctorprofile = []
        for (let i = 0; i < qry1.length; i++) {
            if (qry1[i].hospitalname) {
                console.log(qry1[i].doctorid)
                if (qry1[i].doctorid != undefined && qry1[i].doctorid != 'NAN') {
                    var doctorid = await Doctorcms.findById(qry1[i].doctorid)
                    console.log('doctorid', doctorid)
                    if (doctorid != null) {
                        doctorid = JSON.parse(JSON.stringify(doctorid))
                        zoneQuery = {
                            "related.ref": ObjectId(qry1[i].doctorid),
                            "related.field": 'image'
                        };

                        var doctorimage = await Doctorimg.findOne(zoneQuery)
                        doctorimage = JSON.parse(JSON.stringify(doctorimage))


                        doctorprofile.push({
                            doctorname: doctorid['name'],
                            hospitalname: qry1[i].hospitalname,
                            designation: doctorid['designation'],
                            qualification: doctorid['qualification'],
                            expertise: removeMd(doctorid['expertise']),
                            serviceoffered: removeMd(doctorid['serviceoffered']),
                            experience: removeMd(doctorid['experience']),
                            image: doctorimage['url'],
                            companyname: company.name,
                            address: company.address,
                            companyemail: company.companyemail,
                            logo: company.logosize1,
                            source: 'prehospital'

                        })
                    } else {
                        doctorprofile.push({
                            doctorprofile: qry1[i].doctorprofile[0],
                            source: 'myhospital'
                        })

                    }


                }


            }

        }

        patientest.push(patient, company)
        if (patient.branchoffice != 'NAN') {
            var branchcompanydetails = await Branchcompany.findOne({ branchid: patient.branchoffice })
            patientest.push(branchcompanydetails)

        }

        const { translateJSON } = new AWSTranslateJSON(awsConfig, source, taget);
        opiniondata = []
        acc = []
        treatment = []
        qry1.forEach(element => {
            if (element.hospitalname) {
                element.accreditations.forEach(element1 => {
                    acc.push(element1.name)
                });
                element.treatment.forEach(obj => {
                    treatment.push([obj.id.toString(), obj.name, obj.roomType, obj.minCost.toString(), obj.maxCost.toString()])

                });
                opiniondata.push({
                    hospitalname: element.hospitalname,
                    hospitalcity: element.hospitalcity,
                    accreditations: acc,
                    curdate: element.curdate,
                    doctorname: element.doctorname,
                    remark: element.remarks,
                    stayincountry: element.stayincountry,
                    stayinhospital: element.stayinhospital,
                    evaluationcost: element.evaluationcost,
                    treatment: treatment,
                    diagnosis: element.diagnosis,
                    treatmentplan: element.treatmentplan,
                    initialevaluationminimum: element.initialevaluationminimum,
                    initialevaluationmaximum: element.initialevaluationmaximum,

                })
                acc = []
                treatment = []

            }
        })
        var convertdata = opiniondata

        var obj = {
            greetingsfromheading: "Greetings from",
            weareheading: "We are glad that you have given us an opportunity to assist you. Kindly find below the Opinion received from multiple hospitals, Let us know in case you need any assistance in understanding the opinion",
            hospitalnameheading: "HOSPITAL NAME",
            citynameheading: "CITY NAME",
            accreditationsheading: "ACCREDITATION",
            doctornameheading: "DOCTOR NAME",
            procedureheading: "TREATMENT PLAN",
            diagnosisHeading: "DIAGNOSIS",
            inclusionHeading: "Inclusions",
            inclusion1: "The cost of all investigations related to the procedure.",
            inclusion2: "The cost of the treatment.",
            inclusion3: "The doctor's fee and surgery charges (if required).",
            inclusion4: "The stay of the patient and 1 attendant during hospital admission.",
            inclusion5: "All meals for the patient and the attendant as per the available menu while in hospital.",
            inclusion6: "It also includes complimentary Airport Transfers, Forex Services, and assistance.",
            exclusionHeading: "Exclusions",
            exclusion1: "Any consultation other than in discussion.",
            exclusion2: "Overstay more than package days.",
            exclusion3: "Treatment for any other illness.",
            remarksheading: "REMARKS",
            evaluationcostheading: "EVALUATION COST (IN USD) APPROX",
            treatmentcostheading: "TREATMENT / SURGERY COST (IN USD) APPROX",
            stayheadingheading: "LENGTH OF STAY",
            noteheading: "Note",
            noteparagraph: "Please be informed that this is just an estimate based on the reports sent by you, actual total cost might vary on initial clinical evaluation of the patient on arrival.",
            abovecostpara: `The above costs are actual as quoted by Hospitals and not by ${company.name}! You will be paying to Hospital directly!`,
            asperpara: "As per the directives of Government of India, International patients are requested to travel on Medical Visa",
            hotelheading: "HOTEL OPTIONS",
            travelheading: "TRAVEL ADVISORY",
            forexheading: "FOREX ADVISORY",
            otherheading: "OTHER ADVISORY",
            otherthingsheading: "OTHER THINGS TO KNOW",
            accommodationheading: "Accommodation",
            starthotel: "Star Hotel",
            starthotel3: "3 Star Hotel",
            starthotel4: "4 Star Hotel",
            starthotel5: "5 Star Hotel",
            apartments: "Apartments",
            ratesheading: "Rates",
            rate1: "30 – 50 USD Per Night",
            rate2: "50 – 80 USD Per Night",
            rate3: "80 – 110 USD Per Night",
            rate4: "110 – 250 USD Per Night",
            rate5: "30 – 100 USD Per Night",
            hotelpoint1: "Above Mentioned Rates Of Hotels Are Given Tentative. Exact Hotel Rates And Name Will Be Given Once You Confirm The Destination.",
            hotelpoint2: "Above Mentioned Hotel Rates Are Based On Double Sharing Room Including Breakfast.",
            hotelpoint3: "We offer Apartment only For Longer Duration Treatment.",
            travelpara: "People travelling from selected countries should have Yellow Fever vaccination certificate as per Govt. of India mandate. All passengers arriving to India effective from 14th February 2014 from Kenya, Ethiopia, Afghanistan, Israel, Pakistan, Nigeria and Somalia will have to carry Oral Polio Vaccination (OPV) Certificate taken six week prior to entry. This certificate is mandatory for both Adults and Children. All travellers from above seven countries will now be required to have in their possession a written record of vaccination (patient-retained record) for polio, preferably using IHR 2005 International Certificate of Vaccination or Prophylaxis from a hospital or Centre administering OPV.",
            forexpara: "As per the Government of foreign Exchange rules ( FEMA ), all patients / passengers travelling to India and having currency exceeding USD 5000 or traveller’s cheque exceeding USD 10,000 should declare as per Customs Declaration form ( CDF ) and carry with them CDF Form Please be noted that the amount due for your treatment can either be wire transferred to Hospital account prior to your arrival or transaction can be done using your international credit card upon your arrival, International card has a daily transaction limit, please check with your bank. Transaction can also be done in Foreign Exchange through our Associates.",
            otherpoint1: "The cost mentioned is on approximation. The exact costs will depend on the patient’s general condition, stay in hospital / ICU & consumption of drugs, currency fluctuations and other such cost factors, you can ask the International service staff any clarifications that you may have prior to your admission.",
            otherpoint2: "Stay in Hospital & in India: May vary on medical recovery & progress of patients’ condition.",
            otherpoint3: `Travel expenses for visa formalities are not included in the above estimate and is payable by the patient / attendant for their stay in India (as per the statuary requirements in INDIA). However, ${company.name} facilitates for the aforesaid service. This service will take upto 6 hours and will be done at Foreign Regional Registration Office.`,
            otherpoint4: "Each Person should carry 10 passport size photograph copies which would be required for Visa registration, Mobile SIM card activation.",
            otherpoint5: "The above estimate will be valid for a period of 30 days from the receipt of this mail.",
            otherpoint6: `${company.name} will assign one relationship manager for your treatment and you can coordinate with him for any of the query that you may have.`,
            otherpoint7: `${company.name} has just given you the choices of Hospitals and opinions from different hospital and Doctors, You may select any option and we can facilitate all requirements.`,
            otherthingspara1: "Kindly let us know your travel details so that we can make the necessary arrangements. Please send us scanned images of passports of both the patient and his/her attendant so that we can issue the visa invitation at the earliest. Request both the patient and their respective attendant to carry 2 passport sized photographs each, while travelling for treatment. Please ask patient and his attendant to check their visa type [Patient: Medical Visa (MV) & Medical Attendant (MX)] after getting their visa. We are not accountable if any treatment is not given proper by doctor or hospital, however we will be with you and guide you if you feel treatment given is not proper and services are not proper by the hospital staff.",
            otherthingspara2: "Trust the above is in order.",
            otherthingspara3: "We look forward to hearing from you.",
            otherthingspara4: "If you have any query feels free to write and call us.",
            dateheading: "Date",
            countryheading: "Country",
            opinionheading: "Opinion No.",
            subjectheading: "Subject",
            subjectsub: "Opinion and Quotation for Medical Treatment"

        }
        if (lang == "en") {
            opiniondata.map((obj) => {
                if (obj.accreditations) {
                    obj['acc'] = Object.values(obj.accreditations);;
                }
                obj.treatment = Object.values(obj.treatment);
                return obj
            })
            opiniondata.push(patient, companydetails[0])
            if (patient.branchoffice != 'NAN') {
                opiniondata.push(branchcompanydetails)
            }
            opiniondata.splice(0, 0, obj);

            trans = "NIL"
            eng = "NOTNIL"
            sendemail.sendreportstopatient(patientest, "Patientreport", patient, user, doctorprofile, res, opiniondata, trans, eng, ccsend, req, sentopinion)

        } else {
            const t = await translateJSON(convertdata)
            console.log(t)
            datafilter = t[lang]
            var myData = Object.keys(datafilter).map(key => {
                return datafilter[key];
            })
            myData.map((obj) => {
                if (obj.accreditations) {
                    obj['acc'] = Object.values(obj.accreditations);;
                }
                obj.treatment = Object.values(obj.treatment);
                return obj
            })
            opiniondata.map((obj) => {
                if (obj.accreditations) {
                    obj['acc'] = Object.values(obj.accreditations);;
                }
                obj.treatment = Object.values(obj.treatment);
                return obj
            })
            myData.push(patient, companydetails[0])
            if (patient.branchoffice != 'NAN') {
                myData.push(branchcompanydetails)
            }

            if (lang == "ar") {
                myData.splice(0, 0, Conv.ar);
            } else if (lang == "bn") {
                myData.splice(0, 0, Conv.bn);

            } else if (lang == "fa") {
                myData.splice(0, 0, Conv.fa);

            } else if (lang == "fr") {
                myData.splice(0, 0, Conv.fr);

            } else if (lang == "kk") {
                myData.splice(0, 0, Conv.kk);

            } else if (lang == "mn") {
                myData.splice(0, 0, Conv.mn);

            } else if (lang == "ps") {
                myData.splice(0, 0, Conv.ps);

            } else if (lang == "ru") {
                myData.splice(0, 0, Conv.ru);

            } else if (lang == "pt") {
                myData.splice(0, 0, Conv.pt);

            } else if (lang == "sw") {
                myData.splice(0, 0, Conv.sw);

            } else if (lang == "uk") {
                myData.splice(0, 0, Conv.uk);

            } else if (lang == "uz") {
                myData.splice(0, 0, Conv.uz);

            } else if (lang == "ta") {
                myData.splice(0, 0, Conv.ta);

            } else if (lang == "te") {
                myData.splice(0, 0, Conv.te);

            } else if (lang == "ml") {
                myData.splice(0, 0, Conv.ml);

            } else if (lang == "si") {
                myData.splice(0, 0, Conv.si);

            } else if (lang == "hi") {
                myData.splice(0, 0, Conv.hi);

            } else if (lang == "gu") {
                myData.splice(0, 0, Conv.gu);

            } else if (lang == "ur") {
                myData.splice(0, 0, Conv.ur);

            } else if (lang == "de") {
                myData.splice(0, 0, Conv.de);

            } else if (lang == "it") {
                myData.splice(0, 0, Conv.it);

            } else if (lang == "ja") {
                myData.splice(0, 0, Conv.ja);

            }
            console.log("myData", myData)

            opiniondata.push(patient, companydetails[0])
            if (patient.branchoffice != 'NAN') {
                opiniondata.push(branchcompanydetails)
            }
            opiniondata.splice(0, 0, obj);
            eng = "NIL"
            sendemail.sendreportstopatient(patientest, "Patientreport", patient, user, doctorprofile, res, myData, opiniondata, eng, ccsend, req, sentopinion)


        }
        res.send({ message: "success" })

    } catch (err) {
        next(err);
    }
}
exports.downloadpatientEstimation = async(req, res, next) => {
    try {
        const awsConfig = {
            accessKeyId: process.env.AWS_TRANSLATE_ID,
            secretAccessKey: process.env.AWS_TRANSLATE_SECRET,
            region: process.env.AWS_TRANSLATE_REGION,
        }
        const source = "en";
        lang = req.body[0].language
        console.log(lang)
        const taget = [lang];
        const { userid } = req.params;
        const { patientid } = req.params;
        const sentopinion = new Sentopinion();
        sentopinion.sentopinions = req.body
        const user = await Facilitator.findById(userid)
        const patient = await Patient.findById(patientid)

        qry1 = req.body
        var doctorprofile = []


        var patientest = req.body
        var id = userid
        zoneQuery = { "user": id };
        var companydetails = await Company.find(zoneQuery)
        var company = companydetails[0]
        patientest.push(patient, company)
        if (patient.branchoffice != 'NAN') {
            var branchcompanydetails = await Branchcompany.findOne({ branchid: patient.branchoffice })
            patientest.push(branchcompanydetails)

        }

        const { translateJSON } = new AWSTranslateJSON(awsConfig, source, taget);
        opiniondata = []
        treatment = []
        acc = []
        qry1.forEach(element => {
            if (element.hospitalname) {
                element.accreditations.forEach(element1 => {
                    acc.push(element1.name)
                });
                element.treatment.forEach(obj => {
                    treatment.push([obj.id.toString(), obj.name, obj.roomType, obj.minCost.toString(), obj.maxCost.toString()])

                });
                opiniondata.push({
                    hospitalname: element.hospitalname,
                    hospitalcity: element.hospitalcity,
                    accreditations: acc,
                    curdate: element.curdate,
                    diagnosis: element.diagnosis,
                    doctorname: element.doctorname,
                    remark: element.remarks,
                    stayincountry: element.stayincountry,
                    stayinhospital: element.stayinhospital,
                    evaluationcost: element.evaluationcost,
                    treatment: treatment,
                    treatmentplan: element.treatmentplan,
                    initialevaluationminimum: element.initialevaluationminimum,
                    initialevaluationmaximum: element.initialevaluationmaximum,
                })
                acc = []
                treatment = []
            }
        })

        var convertdata = opiniondata
        console.log(convertdata[0].treatment)

        var obj = {
            greetingsfromheading: "Greetings from",
            weareheading: "We are glad that you have given us an opportunity to assist you. Kindly find below the Opinion received from multiple hospitals, Let us know in case you need any assistance in understanding the opinion",
            hospitalnameheading: "HOSPITAL NAME",
            citynameheading: "CITY NAME",
            accreditationsheading: "ACCREDITATION",
            doctornameheading: "DOCTOR NAME",
            procedureheading: "TREATMENT PLAN",
            diagnosisHeading: "DIAGNOSIS",
            inclusionHeading: "Inclusions",
            inclusion1: "The cost of all investigations related to the procedure.",
            inclusion2: "The cost of the treatment.",
            inclusion3: "The doctor's fee and surgery charges (if required).",
            inclusion4: "The stay of the patient and 1 attendant during hospital admission.",
            inclusion5: "All meals for the patient and the attendant as per the available menu while in hospital.",
            inclusion6: "It also includes complimentary Airport Transfers, Forex Services, and assistance.",
            exclusionHeading: "Exclusions",
            exclusion1: "Any consultation other than in discussion.",
            exclusion2: "Overstay more than package days.",
            exclusion3: "Treatment for any other illness.",

            remarksheading: "REMARKS",
            evaluationcostheading: "EVALUATION COST (IN USD) APPROX",
            treatmentcostheading: "TREATMENT / SURGERY COST (IN USD) APPROX",
            stayheadingheading: "LENGTH OF STAY",
            noteheading: "Note",
            noteparagraph: "Please be informed that this is just an estimate based on the reports sent by you, actual total cost might vary on initial clinical evaluation of the patient on arrival.",
            abovecostpara: `The above costs are actual as quoted by Hospitals and not by ${company.name}! You will be paying to Hospital directly!`,
            asperpara: "As per the directives of Government of India, International patients are requested to travel on Medical Visa",
            hotelheading: "HOTEL OPTIONS",
            travelheading: "TRAVEL ADVISORY",
            forexheading: "FOREX ADVISORY",
            otherheading: "OTHER ADVISORY",
            otherthingsheading: "OTHER THINGS TO KNOW",
            accommodationheading: "Accommodation",
            starthotel: "Star Hotel",
            starthotel3: "3 Star Hotel",
            starthotel4: "4 Star Hotel",
            starthotel5: "5 Star Hotel",
            apartments: "Apartments",
            ratesheading: "Rates",
            rate1: "30 – 50 USD Per Night",
            rate2: "50 – 80 USD Per Night",
            rate3: "80 – 110 USD Per Night",
            rate4: "110 – 250 USD Per Night",
            rate5: "30 – 100 USD Per Night",
            hotelpoint1: "Above Mentioned Rates Of Hotels Are Given Tentative. Exact Hotel Rates And Name Will Be Given Once You Confirm The Destination.",
            hotelpoint2: "Above Mentioned Hotel Rates Are Based On Double Sharing Room Including Breakfast.",
            hotelpoint3: "We offer Apartment only For Longer Duration Treatment.",
            travelpara: "People travelling from selected countries should have Yellow Fever vaccination certificate as per Govt. of India mandate. All passengers arriving to India effective from 14th February 2014 from Kenya, Ethiopia, Afghanistan, Israel, Pakistan, Nigeria and Somalia will have to carry Oral Polio Vaccination (OPV) Certificate taken six week prior to entry. This certificate is mandatory for both Adults and Children. All travellers from above seven countries will now be required to have in their possession a written record of vaccination (patient-retained record) for polio, preferably using IHR 2005 International Certificate of Vaccination or Prophylaxis from a hospital or Centre administering OPV.",
            forexpara: "As per the Government of foreign Exchange rules ( FEMA ), all patients / passengers travelling to India and having currency exceeding USD 5000 or traveller’s cheque exceeding USD 10,000 should declare as per Customs Declaration form ( CDF ) and carry with them CDF Form Please be noted that the amount due for your treatment can either be wire transferred to Hospital account prior to your arrival or transaction can be done using your international credit card upon your arrival, International card has a daily transaction limit, please check with your bank. Transaction can also be done in Foreign Exchange through our Associates.",
            otherpoint1: "The cost mentioned is on approximation. The exact costs will depend on the patient’s general condition, stay in hospital / ICU & consumption of drugs, currency fluctuations and other such cost factors, you can ask the International service staff any clarifications that you may have prior to your admission.",
            otherpoint2: "Stay in Hospital & in India: May vary on medical recovery & progress of patients’ condition.",
            otherpoint3: `Travel expenses for visa formalities are not included in the above estimate and is payable by the patient / attendant for their stay in India (as per the statuary requirements in INDIA). However, ${company.name} facilitates for the aforesaid service. This service will take upto 6 hours and will be done at Foreign Regional Registration Office.`,
            otherpoint4: "Each Person should carry 10 passport size photograph copies which would be required for Visa registration, Mobile SIM card activation.",
            otherpoint5: "The above estimate will be valid for a period of 30 days from the receipt of this mail.",
            otherpoint6: `${company.name} will assign one relationship manager for your treatment and you can coordinate with him for any of the query that you may have.`,
            otherpoint7: `${company.name} has just given you the choices of Hospitals and opinions from different hospital and Doctors, You may select any option and we can facilitate all requirements.`,
            otherthingspara1: "Kindly let us know your travel details so that we can make the necessary arrangements. Please send us scanned images of passports of both the patient and his/her attendant so that we can issue the visa invitation at the earliest. Request both the patient and their respective attendant to carry 2 passport sized photographs each, while travelling for treatment. Please ask patient and his attendant to check their visa type [Patient: Medical Visa (MV) & Medical Attendant (MX)] after getting their visa. We are not accountable if any treatment is not given proper by doctor or hospital, however we will be with you and guide you if you feel treatment given is not proper and services are not proper by the hospital staff.",
            otherthingspara2: "Trust the above is in order.",
            otherthingspara3: "We look forward to hearing from you.",
            otherthingspara4: "If you have any query feels free to write and call us.",
            dateheading: "Date",
            countryheading: "Country",
            opinionheading: "Opinion No.",
            subjectheading: "Subject",
            subjectsub: "Opinion and Quotation for Medical Treatment"

        }

        if (lang == "en") {
            opiniondata.map((obj) => {
                if (obj.accreditations) {
                    obj['acc'] = Object.values(obj.accreditations);;
                }
                obj.treatment = Object.values(obj.treatment);
                return obj

            })
            opiniondata.push(patient, companydetails[0])
            if (patient.branchoffice != 'NAN') {
                opiniondata.push(branchcompanydetails)
            }
            opiniondata.splice(0, 0, obj);
            trans = "NIL"

            sendemail.sendreportstopatient(patientest, "Patientreport", patient, user, doctorprofile, res, opiniondata, trans)

        } else {

            const t = await translateJSON(convertdata)
            console.log(t)
            datafilter = t[lang]
            var myData = Object.keys(datafilter).map(key => {
                return datafilter[key];
            })
            myData.map((obj) => {
                if (obj.accreditations) {
                    obj['acc'] = Object.values(obj.accreditations);

                }
                obj.treatment = Object.values(obj.treatment);
                return obj

            })
            myData.push(patient, companydetails[0])
            if (patient.branchoffice != 'NAN') {
                myData.push(branchcompanydetails)
            }

            if (lang == "ar") {
                myData.splice(0, 0, Conv.ar);
            } else if (lang == "bn") {
                myData.splice(0, 0, Conv.bn);

            } else if (lang == "fa") {
                myData.splice(0, 0, Conv.fa);

            } else if (lang == "fr") {
                myData.splice(0, 0, Conv.fr);

            } else if (lang == "kk") {
                myData.splice(0, 0, Conv.kk);

            } else if (lang == "mn") {
                myData.splice(0, 0, Conv.mn);

            } else if (lang == "ps") {
                myData.splice(0, 0, Conv.ps);

            } else if (lang == "ru") {
                myData.splice(0, 0, Conv.ru);

            } else if (lang == "pt") {
                myData.splice(0, 0, Conv.pt);

            } else if (lang == "sw") {
                myData.splice(0, 0, Conv.sw);

            } else if (lang == "uk") {
                myData.splice(0, 0, Conv.uk);

            } else if (lang == "uz") {
                myData.splice(0, 0, Conv.uz);

            } else if (lang == "ta") {
                myData.splice(0, 0, Conv.ta);

            } else if (lang == "te") {
                myData.splice(0, 0, Conv.te);

            } else if (lang == "ml") {
                myData.splice(0, 0, Conv.ml);

            } else if (lang == "si") {
                myData.splice(0, 0, Conv.si);

            } else if (lang == "hi") {
                myData.splice(0, 0, Conv.hi);

            } else if (lang == "gu") {
                myData.splice(0, 0, Conv.gu);

            } else if (lang == "ur") {
                myData.splice(0, 0, Conv.ur);

            } else if (lang == "de") {
                myData.splice(0, 0, Conv.de);

            } else if (lang == "it") {
                myData.splice(0, 0, Conv.it);

            } else if (lang == "ja") {
                myData.splice(0, 0, Conv.ja);

            }
            console.log("myData", myData[1].treatment)

            trans = "NOTNULL"

            sendemail.sendreportstopatient(patientest, "Patientreport", patient, user, doctorprofile, res, myData, trans)


        }

    } catch (err) {
        next(err);
    }
}
exports.patientaddEstimation = async(req, res, next) => {
    try {
        const awsConfig = {
            accessKeyId: process.env.AWS_TRANSLATE_ID,
            secretAccessKey: process.env.AWS_TRANSLATE_SECRET,
            region: process.env.AWS_TRANSLATE_REGION,
        }
        ccsend = []
        emailcc = req.body[0].emailcc
        emailcc.forEach(element => {
            ccsend.push(element.emailcc)
        });
        const source = "en";
        lang = req.body[0].language
        const taget = [lang];
        const { userid } = req.params;
        const { patientid } = req.params;
        const sentopinion = new Sentopinion();
        sentopinion.sentopinions = req.body
        const user = await Facilitator.findById(userid)
        const patient = await Patient.findById(patientid)
        qry1 = req.body

        sentopinion.user = user
        await sentopinion.save()
        sentopinion.patient = patient
        await sentopinion.save()

        user.sentopinions.push(sentopinion)
        await user.save()

        patient.sentopinions.push(sentopinion)
        await patient.save()


        var patientest = req.body
        var id = userid
        zoneQuery = { "user": id };
        var companydetails = await Company.find(zoneQuery)
        var company = companydetails[0]
        var doctorprofile = []
        for (let i = 0; i < qry1.length; i++) {
            if (qry1[i].hospitalname) {
                console.log(qry1[i].doctorid)
                if (qry1[i].doctorid != undefined && qry1[i].doctorid != 'NAN') {
                    var doctorid = await Doctorcms.findById(qry1[i].doctorid)
                    console.log('doctorid', doctorid)
                    if (doctorid != null) {
                        doctorid = JSON.parse(JSON.stringify(doctorid))
                        zoneQuery = {
                            "related.ref": ObjectId(qry1[i].doctorid),
                            "related.field": 'image'
                        };

                        var doctorimage = await Doctorimg.findOne(zoneQuery)
                        doctorimage = JSON.parse(JSON.stringify(doctorimage))


                        doctorprofile.push({
                            doctorname: doctorid['name'],
                            hospitalname: qry1[i].hospitalname,
                            designation: doctorid['designation'],
                            qualification: doctorid['qualification'],
                            expertise: removeMd(doctorid['expertise']),
                            serviceoffered: removeMd(doctorid['serviceoffered']),
                            experience: removeMd(doctorid['experience']),
                            image: doctorimage['url'],
                            companyname: company.name,
                            address: company.address,
                            companyemail: company.companyemail,
                            logo: company.logosize1,
                            source: 'prehospital'

                        })
                    } else {
                        doctorprofile.push({
                            doctorprofile: qry1[i].doctorprofile[0],
                            source: 'myhospital'
                        })

                    }


                }


            }

        }
        patientest.push(patient, company)
        if (patient.branchoffice != 'NAN') {
            console.log("hi")
            var branchcompanydetails = await Branchcompany.findOne({ branchid: patient.branchoffice })
            patientest.push(branchcompanydetails)

        }
        const { translateJSON } = new AWSTranslateJSON(awsConfig, source, taget);
        opiniondata = []
        acc = []
        treatment = []
        qry1.forEach(element => {
            if (element.hospitalname) {
                element.accreditations.forEach(element1 => {
                    acc.push(element1.name)
                });
                element.treatment.forEach(obj => {
                    treatment.push([obj.id.toString(), obj.name, obj.roomType, obj.minCost.toString(), obj.maxCost.toString()])

                });
                opiniondata.push({
                    hospitalname: element.hospitalname,
                    hospitalcity: element.hospitalcity,
                    accreditations: acc,
                    curdate: element.curdate,
                    doctorname: element.doctorname,
                    remark: element.remarks,
                    stayincountry: element.stayincountry,
                    stayinhospital: element.stayinhospital,
                    evaluationcost: element.evaluationcost,
                    diagnosis: element.diagnosis,
                    treatment: treatment,
                    treatmentplan: element.treatmentplan,
                    initialevaluationminimum: element.initialevaluationminimum,
                    initialevaluationmaximum: element.initialevaluationmaximum,

                })
                acc = []
                treatment = []
            }
        })
        var convertdata = opiniondata

        var obj = {
            greetingsfromheading: "Greetings from",
            weareheading: "We are glad that you have given us an opportunity to assist you. Kindly find below the Opinion received from multiple hospitals, Let us know in case you need any assistance in understanding the opinion",
            hospitalnameheading: "HOSPITAL NAME",
            citynameheading: "CITY NAME",
            accreditationsheading: "ACCREDITATION",
            doctornameheading: "DOCTOR NAME",
            procedureheading: "TREATMENT PLAN",
            diagnosisHeading: "DIAGNOSIS",
            inclusionHeading: "Inclusions",
            inclusion1: "The cost of all investigations related to the procedure.",
            inclusion2: "The cost of the treatment.",
            inclusion3: "The doctor's fee and surgery charges (if required).",
            inclusion4: "The stay of the patient and 1 attendant during hospital admission.",
            inclusion5: "All meals for the patient and the attendant as per the available menu while in hospital.",
            inclusion6: "It also includes complimentary Airport Transfers, Forex Services, and assistance.",
            exclusionHeading: "Exclusions",
            exclusion1: "Any consultation other than in discussion.",
            exclusion2: "Overstay more than package days.",
            exclusion3: "Treatment for any other illness.",

            remarksheading: "REMARKS",
            evaluationcostheading: "EVALUATION COST (IN USD) APPROX",
            treatmentcostheading: "TREATMENT / SURGERY COST (IN USD) APPROX",
            stayheadingheading: "LENGTH OF STAY",
            noteheading: "Note",
            noteparagraph: "Please be informed that this is just an estimate based on the reports sent by you, actual total cost might vary on initial clinical evaluation of the patient on arrival.",
            abovecostpara: `The above costs are actual as quoted by Hospitals and not by ${company.name}! You will be paying to Hospital directly!`,
            asperpara: "As per the directives of Government of India, International patients are requested to travel on Medical Visa",
            hotelheading: "HOTEL OPTIONS",
            travelheading: "TRAVEL ADVISORY",
            forexheading: "FOREX ADVISORY",
            otherheading: "OTHER ADVISORY",
            otherthingsheading: "OTHER THINGS TO KNOW",
            accommodationheading: "Accommodation",
            starthotel: "Star Hotel",
            starthotel3: "3 Star Hotel",
            starthotel4: "4 Star Hotel",
            starthotel5: "5 Star Hotel",
            apartments: "Apartments",
            ratesheading: "Rates",
            rate1: "30 – 50 USD Per Night",
            rate2: "50 – 80 USD Per Night",
            rate3: "80 – 110 USD Per Night",
            rate4: "110 – 250 USD Per Night",
            rate5: "30 – 100 USD Per Night",
            hotelpoint1: "Above Mentioned Rates Of Hotels Are Given Tentative. Exact Hotel Rates And Name Will Be Given Once You Confirm The Destination.",
            hotelpoint2: "Above Mentioned Hotel Rates Are Based On Double Sharing Room Including Breakfast.",
            hotelpoint3: "We offer Apartment only For Longer Duration Treatment.",
            travelpara: "People travelling from selected countries should have Yellow Fever vaccination certificate as per Govt. of India mandate. All passengers arriving to India effective from 14th February 2014 from Kenya, Ethiopia, Afghanistan, Israel, Pakistan, Nigeria and Somalia will have to carry Oral Polio Vaccination (OPV) Certificate taken six week prior to entry. This certificate is mandatory for both Adults and Children. All travellers from above seven countries will now be required to have in their possession a written record of vaccination (patient-retained record) for polio, preferably using IHR 2005 International Certificate of Vaccination or Prophylaxis from a hospital or Centre administering OPV.",
            forexpara: "As per the Government of foreign Exchange rules ( FEMA ), all patients / passengers travelling to India and having currency exceeding USD 5000 or traveller’s cheque exceeding USD 10,000 should declare as per Customs Declaration form ( CDF ) and carry with them CDF Form Please be noted that the amount due for your treatment can either be wire transferred to Hospital account prior to your arrival or transaction can be done using your international credit card upon your arrival, International card has a daily transaction limit, please check with your bank. Transaction can also be done in Foreign Exchange through our Associates.",
            otherpoint1: "The cost mentioned is on approximation. The exact costs will depend on the patient’s general condition, stay in hospital / ICU & consumption of drugs, currency fluctuations and other such cost factors, you can ask the International service staff any clarifications that you may have prior to your admission.",
            otherpoint2: "Stay in Hospital & in India: May vary on medical recovery & progress of patients’ condition.",
            otherpoint3: `Travel expenses for visa formalities are not included in the above estimate and is payable by the patient / attendant for their stay in India (as per the statuary requirements in INDIA). However, ${company.name} facilitates for the aforesaid service. This service will take upto 6 hours and will be done at Foreign Regional Registration Office.`,
            otherpoint4: "Each Person should carry 10 passport size photograph copies which would be required for Visa registration, Mobile SIM card activation.",
            otherpoint5: "The above estimate will be valid for a period of 30 days from the receipt of this mail.",
            otherpoint6: `${company.name} will assign one relationship manager for your treatment and you can coordinate with him for any of the query that you may have.`,
            otherpoint7: `${company.name} has just given you the choices of Hospitals and opinions from different hospital and Doctors, You may select any option and we can facilitate all requirements.`,
            otherthingspara1: "Kindly let us know your travel details so that we can make the necessary arrangements. Please send us scanned images of passports of both the patient and his/her attendant so that we can issue the visa invitation at the earliest. Request both the patient and their respective attendant to carry 2 passport sized photographs each, while travelling for treatment. Please ask patient and his attendant to check their visa type [Patient: Medical Visa (MV) & Medical Attendant (MX)] after getting their visa. We are not accountable if any treatment is not given proper by doctor or hospital, however we will be with you and guide you if you feel treatment given is not proper and services are not proper by the hospital staff.",
            otherthingspara2: "Trust the above is in order.",
            otherthingspara3: "We look forward to hearing from you.",
            otherthingspara4: "If you have any query feels free to write and call us.",
            dateheading: "Date",
            countryheading: "Country",
            opinionheading: "Opinion No.",
            subjectheading: "Subject",
            subjectsub: "Opinion and Quotation for Medical Treatment"

        }
        if (lang == "en") {
            opiniondata.map((obj) => {
                if (obj.accreditations) {
                    obj['acc'] = Object.values(obj.accreditations);;
                }
                obj.treatment = Object.values(obj.treatment);
                return obj
            })
            opiniondata.push(patient, companydetails[0])
            if (patient.branchoffice != 'NAN') {
                opiniondata.push(branchcompanydetails)
            }
            opiniondata.splice(0, 0, obj);

            trans = "NIL"
            eng = "NOTNIL"

            sendemail.sendreportstoaddpatient(patientest, "Patientreport", patient, user, doctorprofile, res, opiniondata, trans, eng, ccsend, req)

        } else {
            const t = await translateJSON(convertdata)
            console.log(t)
            datafilter = t[lang]
            var myData = Object.keys(datafilter).map(key => {
                return datafilter[key];
            })
            myData.map((obj) => {
                if (obj.accreditations) {
                    obj['acc'] = Object.values(obj.accreditations);;
                }
                obj.treatment = Object.values(obj.treatment);
                return obj
            })
            opiniondata.map((obj) => {
                if (obj.accreditations) {
                    obj['acc'] = Object.values(obj.accreditations);;
                }
                obj.treatment = Object.values(obj.treatment);
                return obj
            })
            myData.push(patient, companydetails[0])
            if (patient.branchoffice != 'NAN') {
                myData.push(branchcompanydetails)
            }

            if (lang == "ar") {
                myData.splice(0, 0, Conv.ar);
            } else if (lang == "bn") {
                myData.splice(0, 0, Conv.bn);

            } else if (lang == "fa") {
                myData.splice(0, 0, Conv.fa);

            } else if (lang == "fr") {
                myData.splice(0, 0, Conv.fr);

            } else if (lang == "kk") {
                myData.splice(0, 0, Conv.kk);

            } else if (lang == "mn") {
                myData.splice(0, 0, Conv.mn);

            } else if (lang == "ps") {
                myData.splice(0, 0, Conv.ps);

            } else if (lang == "ru") {
                myData.splice(0, 0, Conv.ru);

            } else if (lang == "pt") {
                myData.splice(0, 0, Conv.pt);

            } else if (lang == "sw") {
                myData.splice(0, 0, Conv.sw);

            } else if (lang == "uk") {
                myData.splice(0, 0, Conv.uk);

            } else if (lang == "uz") {
                myData.splice(0, 0, Conv.uz);

            } else if (lang == "ta") {
                myData.splice(0, 0, Conv.ta);

            } else if (lang == "te") {
                myData.splice(0, 0, Conv.te);

            } else if (lang == "ml") {
                myData.splice(0, 0, Conv.ml);

            } else if (lang == "si") {
                myData.splice(0, 0, Conv.si);

            } else if (lang == "hi") {
                myData.splice(0, 0, Conv.hi);

            } else if (lang == "gu") {
                myData.splice(0, 0, Conv.gu);

            } else if (lang == "ur") {
                myData.splice(0, 0, Conv.ur);

            } else if (lang == "de") {
                myData.splice(0, 0, Conv.de);

            } else if (lang == "it") {
                myData.splice(0, 0, Conv.it);

            } else if (lang == "ja") {
                myData.splice(0, 0, Conv.ja);

            }
            console.log("myData", myData)

            opiniondata.push(patient, companydetails[0])
            if (patient.branchoffice != 'NAN') {
                opiniondata.push(branchcompanydetails)
            }
            opiniondata.splice(0, 0, obj);
            eng = "NIL"

            sendemail.sendreportstoaddpatient(patientest, "Patientreport", patient, user, doctorprofile, res, myData, opiniondata, eng, ccsend, req)


        }
        res.send({ message: "success" })

    } catch (err) {
        next(err);
    }
}
exports.getPatient = async(req, res, next) => {
    try {
        const { userid } = req.params;

        const user = await Patient.find({ $or: [{ user: userid }, { aggregator: { $in: userid } }], queryClosed: { $ne: true } }).populate('confirmations receives opdresponses')
        res.send(user)
    } catch (err) {
        next(err);
    }

}
exports.getPatientClosed = async(req, res, next) => {
    try {
        const { userid } = req.params;

        const user = await Patient.find({ $or: [{ user: userid }, { aggregator: { $in: userid } }], queryClosed: true }).populate('confirmations receives opdresponses')
        res.send(user)
    } catch (err) {
        next(err);
    }

}
exports.getPatientDashboard = async(req, res, next) => {
    try {
        const { userid } = req.params;

        const user = await Patient.find({ $or: [{ user: userid }, { aggregator: { $in: userid } }] }).populate('confirmations receives opdresponses')
        res.send(user)
    } catch (err) {
        next(err);
    }

}
exports.getPatientbydate = (req, res) => {
    var id = req.params.userid;
    const startOfCurrentMonth = new Date();
    startOfCurrentMonth.setDate(1);

    const startOfNextMonth = new Date();
    startOfNextMonth.setDate(1);
    startOfNextMonth.setMonth(startOfNextMonth.getMonth() + 1);

    zoneQuery = {
        $or: [{ user: id }, { aggregator: { $in: id } }],
        "date": {
            $gte: startOfCurrentMonth,
            $lt: startOfNextMonth
        }
    };
    Patient.find(zoneQuery)
        .then(data => {

            if (data) {

                res.send(data);

            } else {
                return res.status(400).send({ message: 'Data not found' });
            }
            // res.send(data);
        }).catch(err => {
            res.status(500).send({
                message: "Some error occurred while searching"
            });
        });
}
exports.getPatientByRole = (req, res) => {
    const id = req.params.userid;
    const branchid = req.params.branchid;

    zoneQuery = {
        $or: [{ user: id }, { aggregator: { $in: id } }],
        "branchoffice": branchid,
        queryClosed: { $ne: true }
    };
    Patient.find(zoneQuery).populate('confirmations receives opdresponses')
        .then(data => {

            if (data) {

                res.send(data);

            } else {
                return res.status(400).send({ message: 'Data not found' });
            }
            // res.send(data);
        }).catch(err => {
            res.status(500).send({
                message: "Some error occurred while searching"
            });
        });
}
exports.getPatientByRoleClosed = (req, res) => {
    const id = req.params.userid;
    const branchid = req.params.branchid;

    zoneQuery = {
        $or: [{ user: id }, { aggregator: { $in: id } }],
        "branchoffice": branchid,
        queryClosed: true


    };
    Patient.find(zoneQuery).populate('confirmations receives opdresponses')
        .then(data => {

            if (data) {

                res.send(data);

            } else {
                return res.status(400).send({ message: 'Data not found' });
            }
            // res.send(data);
        }).catch(err => {
            res.status(500).send({
                message: "Some error occurred while searching"
            });
        });
}
exports.getPatientByRoleDashboard = (req, res) => {
    const id = req.params.userid;
    const branchid = req.params.branchid;

    zoneQuery = {
        $or: [{ user: id }, { aggregator: { $in: id } }],
        "branchoffice": branchid

    };
    Patient.find(zoneQuery).populate('confirmations receives opdresponses')
        .then(data => {

            if (data) {

                res.send(data);

            } else {
                return res.status(400).send({ message: 'Data not found' });
            }
            // res.send(data);
        }).catch(err => {
            res.status(500).send({
                message: "Some error occurred while searching"
            });
        });
}
exports.getPatientByRefferal = (req, res) => {
    const id = req.params.userid;
    const refferalid = req.params.refferalid;

    zoneQuery = {
        $or: [{ user: id }, { aggregator: { $in: id } }],
        "refferalpartner._id": refferalid,
        queryClosed: { $ne: true }
    };
    Patient.find(zoneQuery).populate('confirmations receives opdresponses')
        .then(data => {

            if (data) {

                res.send(data);

            } else {
                return res.status(400).send({ message: 'Data not found' });
            }
            // res.send(data);
        }).catch(err => {
            res.status(500).send({
                message: "Some error occurred while searching"
            });
        });
}
exports.getPatientByRefferalClosed = (req, res) => {
    const id = req.params.userid;
    const refferalid = req.params.refferalid;

    zoneQuery = {
        $or: [{ user: id }, { aggregator: { $in: id } }],
        "refferalpartner._id": refferalid,
        queryClosed: true


    };
    Patient.find(zoneQuery).populate('confirmations receives opdresponses')
        .then(data => {

            if (data) {

                res.send(data);

            } else {
                return res.status(400).send({ message: 'Data not found' });
            }
            // res.send(data);
        }).catch(err => {
            res.status(500).send({
                message: "Some error occurred while searching"
            });
        });
}
exports.getPatientByRefferalDashboard = (req, res) => {
    const id = req.params.userid;
    const refferalid = req.params.refferalid;

    zoneQuery = {
        $or: [{ user: id }, { aggregator: { $in: id } }],
        "refferalpartner._id": refferalid

    };
    Patient.find(zoneQuery).populate('confirmations receives opdresponses')
        .then(data => {

            if (data) {

                res.send(data);

            } else {
                return res.status(400).send({ message: 'Data not found' });
            }
            // res.send(data);
        }).catch(err => {
            res.status(500).send({
                message: "Some error occurred while searching"
            });
        });
}
exports.getPatientByRoleDate = (req, res) => {
    const id = req.params.userid;
    const branchid = req.params.branchid;
    const startOfCurrentMonth = new Date();
    startOfCurrentMonth.setDate(1);

    const startOfNextMonth = new Date();
    startOfNextMonth.setDate(1);
    startOfNextMonth.setMonth(startOfNextMonth.getMonth() + 1);
    zoneQuery = {
        $or: [{ user: id }, { aggregator: { $in: id } }],
        "branchoffice": branchid,
        "date": {
            $gte: startOfCurrentMonth,
            $lt: startOfNextMonth
        }
    };
    Patient.find(zoneQuery)
        .then(data => {

            if (data) {

                res.send(data);

            } else {
                return res.status(400).send({ message: 'Data not found' });
            }
            // res.send(data);
        }).catch(err => {
            res.status(500).send({
                message: "Some error occurred while searching"
            });
        });
}
exports.getPatientByRefferalDate = (req, res) => {
    const id = req.params.userid;
    const refferalid = req.params.refferalid;
    const startOfCurrentMonth = new Date();
    startOfCurrentMonth.setDate(1);

    const startOfNextMonth = new Date();
    startOfNextMonth.setDate(1);
    startOfNextMonth.setMonth(startOfNextMonth.getMonth() + 1);
    zoneQuery = {
        $or: [{ user: id }, { aggregator: { $in: id } }],
        "refferalpartner._id": refferalid,
        "date": {
            $gte: startOfCurrentMonth,
            $lt: startOfNextMonth
        }
    };
    Patient.find(zoneQuery)
        .then(data => {

            if (data) {

                res.send(data);

            } else {
                return res.status(400).send({ message: 'Data not found' });
            }
            // res.send(data);
        }).catch(err => {
            res.status(500).send({
                message: "Some error occurred while searching"
            });
        });
}
exports.delPatientid = async(req, res, next) => {
    try {
        var patid = req.params.id
        var userid = req.params.userid;

        if (!ObjectId.isValid(req.params.id))
            return res.status(400).send({ message: `No record with given id : ${req.params.id}` });


        patientdoc = await Patient.findByIdAndRemove(req.params.id);
        await Facilitator.update({ _id: userid }, { $pull: { patients: patid } });
        res.send(patientdoc);

        await Request.deleteMany({ "patient": patid });
        await Received.deleteMany({ "patient": patid });
        await Receivededit.deleteMany({ "patient": patid });
        await Hospitalopinion.deleteMany({ "patient": patid });
        await Doctoropinion.deleteMany({ "patient": patid });
        await Sentopinion.deleteMany({ "patient": patid });
        await Responsevil.deleteMany({ "patient": patid });
        await Sentvil.deleteMany({ "patient": patid });
        await Pdfmaking.deleteMany({ "patient": patid });
        await Preintimation.deleteMany({ "patient": patid });
        await Opdrequest.deleteMany({ "patient": patid });
        await Opdresponse.deleteMany({ "patient": patid });
        await Opdsent.deleteMany({ "patient": patid });
        await Confirmation.deleteMany({ "patient": patid });
        await Vil.deleteMany({ "patient": patid });
        await Profoma.deleteMany({ "patient": patid });
        await Piresponse.deleteMany({ "patient": patid });
        await Pisent.deleteMany({ "patient": patid });

    } catch (err) {
        next(err);
    }

}

exports.putPatient = async(req, res) => {
    const role = JSON.parse(req.body.role)
    const refferalpartner = JSON.parse(req.body.refferalpartner)
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });
    const patient = new Patient();

    if (req.files.length != 0) {
        var id = req.params.id;
        zoneQuery = { "_id": id };

        data = await Patient.find(zoneQuery)
        if (data) {


            qry1 = data[0].patientProfile


        } else {
            console.log("Data not found");
        }
        Array.prototype.push.apply(req.files, data[0].patientProfile);

        for (let i = 0; i < req.files.length; i++) {
            patient.patientProfile[i] = req.files[i];

        }

        var patientt = {
            name: req.body.name,
            gender: req.body.gender,
            country: req.body.country,
            uhidcode: req.body.uhidcode,
            age: req.body.age,
            ageduration: req.body.ageduration,
            passportNumber: req.body.passportNumber,
            contact: req.body.contact,
            emailid: req.body.emailid,
            treatment: req.body.treatment,
            branchoffice: req.body.branchoffice,
            employee: req.body.employee,
            refferalpartner: refferalpartner,
            companyname: req.body.companyname,
            medicalhistory: req.body.medicalhistory,
            patientProfile: patient.patientProfile,
            remarks: req.body.remarks,

        };
        if (req.body.branchoffice == "" || req.body.branchoffice == "undefined") {
            patientt.branchoffice = 'NAN';

        } else {
            patientt.branchoffice = req.body.branchoffice;

        }
        if (req.body.employee == "" || req.body.employee == "undefined") {
            patientt.employee = 'NAN';

        } else {
            patientt.employee = req.body.employee;

        }
        if (req.body.refferalpartner == "{}") {
            patientt.refferalpartner = 'NAN';

        } else {
            patientt.refferalpartner = refferalpartner;

        }
        Patient.findByIdAndUpdate(req.params.id, { $set: patientt }, { new: true }, (err, doc) => {
            if (!err) {
                res.send(doc);
            } else { return res.status(400).send({ message: 'error in update the documents' }); }
        });

    } else if (req.files.length == 0) {
        console.log('second')
        var patientt = {
            name: req.body.name,
            gender: req.body.gender,
            country: req.body.country,
            uhidcode: req.body.uhidcode,
            age: req.body.age,
            ageduration: req.body.ageduration,
            passportNumber: req.body.passportNumber,
            contact: req.body.contact,
            emailid: req.body.emailid,
            treatment: req.body.treatment,
            branchoffice: req.body.branchoffice,
            refferalpartner: refferalpartner,
            companyname: req.body.companyname,
            remarks: req.body.remarks,
            medicalhistory: req.body.medicalhistory,

        };
        if (req.body.branchoffice == "" || req.body.branchoffice == "undefined") {
            patientt.branchoffice = 'NAN';

        } else {
            patientt.branchoffice = req.body.branchoffice;

        }
        if (req.body.employee == "" || req.body.employee == "undefined") {
            patientt.employee = 'NAN';

        } else {
            patientt.employee = req.body.employee;

        }
        if (req.body.refferalpartner == "{}") {
            patientt.refferalpartner = 'NAN';

        } else {
            patientt.refferalpartner = refferalpartner;

        }
        Patient.findByIdAndUpdate(req.params.id, { $set: patientt }, { new: true }, (err, doc) => {
            if (!err) {
                res.send(doc);
            } else { return res.status(400).send({ message: 'error in update the documents' }); }
        });

    }


}
exports.comment = async(req, res, next) => {
    try {

        if (!ObjectId.isValid(req.params.id))
            return res.status(400).send({ message: `No record with given id : ${req.params.id}` });


        const patient = await Patient.findById(req.params.id)
        patient.comment.push(req.body[0])
        patient.save()
        res.send({ message: "Success" })
    } catch (err) {
        next(err)
    }
}
exports.closed = async(req, res, next) => {
    try {

        if (!ObjectId.isValid(req.params.id))
            return res.status(400).send({ message: `No record with given id : ${req.params.id}` });


        const patient = await Patient.findById(req.params.id)
        patient.queryClosed = true;
        patient.closedReason = req.body.closedReason;
        patient.closedDate = Date.now();
        patient.save()
        res.send({ message: "Success" })
    } catch (err) {
        next(err)
    }
}
exports.opened = async(req, res, next) => {
    try {

        if (!ObjectId.isValid(req.params.id))
            return res.status(400).send({ message: `No record with given id : ${req.params.id}` });


        const patient = await Patient.findById(req.params.id)
        patient.queryClosed = false;
        patient.save()
        res.send({ message: "Success" })
    } catch (err) {
        next(err)
    }
}
exports.getPatientId = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    Patient.findById(req.params.id, (err, doc) => {
        if (!err) {
            res.send(doc);
        } else { return res.status(400).send({ message: 'error in retrieving the documents' }); }
    }).populate('confirmations receives')

}
exports.plan = async(req, res, next) => {
    try {
        async function validate(user) {
            if (user.Role != 'Super') {
                if (user.subscription_id) {
                    const tokenData = await Zoho.find({})
                    const token = tokenData[tokenData.length - 1].data.access_token
                    const subscription = await axios.get(`https://subscriptions.zoho.in/api/v1/subscriptions/${user.subscription_id}`, { headers: { "Authorization": `Bearer ${token}` } })
                    const plan = await axios.get(`https://subscriptions.zoho.in/api/v1/plans/${subscription.data.subscription.plan.plan_code}`, { headers: { "Authorization": `Bearer ${token}` } })
                    patient = await Patient.find({
                        date: {
                            $gte: subscription.data.subscription.last_billing_at,
                            $lt: subscription.data.subscription.next_billing_at
                        },
                        user: user._id
                    })
                    customFields = plan.data.plan.custom_fields
                    let date = new Date(subscription.data.subscription.next_billing_at);
                    let currentDate = new Date();
                    daysleft = Math.ceil((date.getTime() - currentDate.getTime()) / 1000 / 60 / 60 / 24);
                    console.log('daysleft', daysleft)
                    if (daysleft > 0) {
                        if (patient.length < Number(customFields[0].value)) {
                            return next()

                        } else {
                            return res.status(400).send({ message: 'Limit Exceeded' })
                        }

                    } else {
                        return res.status(400).send({ message: 'Renew your plan' })

                    }

                } else {
                    return res.status(400).send({ message: 'Please take subscription' })
                }
            } else {
                return next()


            }
        }
        if (!req.headers.authorization) {
            return next()

        }
        let token = req.headers.authorization.split(' ')[1]

        if (token === 'null') {
            user = await Facilitator.findOne({ _id: req.params.userid })
            return validate(user)
        }
        var decoded = jwt_decode(token);
        user = await Facilitator.findOne({ _id: decoded.id })
        return validate(user)
    } catch (err) {
        next(err)
    }
}
exports.getPatientByLimit = async(req, res, next) => {
    try {
        var id = req.params.userid;
        user = await Facilitator.findOne({ _id: id })

        if (user.Role != 'Super') {
            if (user.subscription_id) {
                const tokenData = await Zoho.find({})
                const token = tokenData[tokenData.length - 1].data.access_token
                const subscription = await axios.get(`https://subscriptions.zoho.in/api/v1/subscriptions/${user.subscription_id}`, { headers: { "Authorization": `Bearer ${token}` } })
                const plan = await axios.get(`https://subscriptions.zoho.in/api/v1/plans/${subscription.data.subscription.plan.plan_code}`, { headers: { "Authorization": `Bearer ${token}` } })
                patient = await Patient.find({
                    date: {
                        $gte: subscription.data.subscription.last_billing_at,
                        $lt: subscription.data.subscription.next_billing_at
                    },
                    "user": id,
                })
                res.send({
                    patient: patient,
                    subscription: subscription.data.subscription,
                    plan: plan.data.plan
                });

            } else {
                return res.status(400).send({ message: 'Please take subscription' })

            }

        } else {
            res.status(200).send({ message: "Not for super" })
        }
    } catch (err) {
        next(err)
    }

}

exports.getTotalPatient = async(req, res, next) => {
    try {
        let token = req.headers.authorization.split(' ')[1]

        var decoded = jwt_decode(token);

        if (decoded.Role == 'Supreme Sorcerer') {
            const patient = await Patient.find({}, { _id: 1 })
            const patientHospital = await PatientHospital.find({}, { _id: 1 })
            const data = patient.concat(patientHospital)
            res.status(200).send({ data: data.length })
        } else if (decoded.Role == 'Distributor') {
            const patient = await Patient.find({}, { _id: 1 }).populate({
                path: 'user',
                match: { distributor: { $in: decoded.id } }
            })

            const patientHospital = await PatientHospital.find({}, { _id: 1 }).populate({
                path: 'associatedhospital.id',
                model: HospitalUser,
                match: { distributor: { $in: decoded.id } }
            })
            const dataFilterpatient = patient.filter(data => data.user != null);
            const dataFilterHospital = patientHospital.filter(data => data.associatedhospital.id != null);

            const data = dataFilterpatient.concat(dataFilterHospital)

            res.status(200).send({ data: data.length })
        }
    } catch (err) {
        next(err)
    }

}
exports.getTotalPatientByMonth = async(req, res, next) => {
    try {
        let token = req.headers.authorization.split(' ')[1]

        var decoded = jwt_decode(token);
        const query = {
            "createdAt": {
                $gte: new Date((new Date().getTime() - (30 * 24 * 60 * 60 * 1000)))
            }
        };
        if (decoded.Role == 'Supreme Sorcerer') {


            const patient = await Patient.find(query, { _id: 1 })
            const patientHospital = await PatientHospital.find(query, { _id: 1 })
            const data = patient.concat(patientHospital)

            res.status(200).send({ data: data.length })
        } else if (decoded.Role == 'Distributor') {
            const patient = await Patient.find(query, { _id: 1 }).populate({
                path: 'user',
                match: { distributor: { $in: decoded.id } }
            })

            const patientHospital = await PatientHospital.find(query, { _id: 1 }).populate({
                path: 'associatedhospital.id',
                model: HospitalUser,
                match: { distributor: { $in: decoded.id } }
            })
            const dataFilterpatient = patient.filter(data => data.user != null);
            const dataFilterHospital = patientHospital.filter(data => data.associatedhospital.id != null);

            const data = dataFilterpatient.concat(dataFilterHospital)

            res.status(200).send({ data: data.length })
        }
    } catch (err) {
        next(err)
    }

}
exports.getTotalVil = async(req, res, next) => {

    try {
        let token = req.headers.authorization.split(' ')[1]
        var decoded = jwt_decode(token);
        if (decoded.Role == 'Supreme Sorcerer') {
            const vil = await Vil.find({}, { _id: 1 })
            const vilHospital = await VilHospital.find({}, { _id: 1 })
            const data = vil.concat(vilHospital)
            res.status(200).send({ data: data.length })
        } else if (decoded.Role == 'Distributor') {

            const vil = await Vil.find({}, { _id: 1 }).populate({
                path: 'patient',

                populate: {
                    path: 'user',
                    match: { distributor: { $in: decoded.id } }
                }


            })
            const vilHospital = await VilHospital.find({}, { _id: 1 }).populate({
                path: 'patient',

                populate: {
                    path: 'associatedhospital.id',
                    model: HospitalUser,
                    match: { distributor: { $in: decoded.id } }
                }
            })
            const dataFilterVilPatient = vil.filter(data => data.patient != null);
            const dataFilterVil = dataFilterVilPatient.filter(data => data.patient.user != null);
            const dataFilterVilHospitalPatient = vilHospital.filter(data => data.patient != null);
            const dataFilterVilHospital = dataFilterVilHospitalPatient.filter(data => data.patient.associatedhospital.id != null);

            const data = dataFilterVil.concat(dataFilterVilHospital)
            res.status(200).send({ data: data.length })

        }

    } catch (err) {
        next(err)
    }

}
exports.getTotalVilByMonth = async(req, res, next) => {
    try {
        const query = {
            "createdAt": {
                $gte: new Date((new Date().getTime() - (30 * 24 * 60 * 60 * 1000)))
            }
        };
        let token = req.headers.authorization.split(' ')[1]
        var decoded = jwt_decode(token);
        if (decoded.Role == 'Supreme Sorcerer') {
            const vil = await Vil.find(query, { _id: 1 })
            const vilHospital = await VilHospital.find(query, { _id: 1 })
            const data = vil.concat(vilHospital)
            res.status(200).send({ data: data.length })
        } else if (decoded.Role == 'Distributor') {
            const vil = await Vil.find(query, { _id: 1 }).populate({
                path: 'patient',

                populate: {
                    path: 'user',
                    match: { distributor: { $in: decoded.id } }
                }


            })
            const vilHospital = await VilHospital.find(query, { _id: 1 }).populate({
                path: 'patient',

                populate: {
                    path: 'associatedhospital.id',
                    model: HospitalUser,
                    match: { distributor: { $in: decoded.id } }
                }
            })
            const dataFilterVilPatient = vil.filter(data => data.patient != null);
            const dataFilterVil = dataFilterVilPatient.filter(data => data.patient.user != null);
            const dataFilterVilHospitalPatient = vilHospital.filter(data => data.patient != null);
            const dataFilterVilHospital = dataFilterVilHospitalPatient.filter(data => data.patient.associatedhospital.id != null);

            const data = dataFilterVil.concat(dataFilterVilHospital)
            res.status(200).send({ data: data.length })
        }
    } catch (err) {
        next(err)
    }

}
exports.getTotalConf = async(req, res, next) => {
    try {
        let token = req.headers.authorization.split(' ')[1]
        var decoded = jwt_decode(token);
        if (decoded.Role == 'Supreme Sorcerer') {
            const confirmation = await Confirmation.find({}, { _id: 1 })
            const confirmationHospital = await ConfirmationHospital.find({}, { _id: 1 })
            const data = confirmation.concat(confirmationHospital)
            res.status(200).send({ data: data.length })
        } else if (decoded.Role == 'Distributor') {
            const confirmation = await Confirmation.find({}, { _id: 1 }).populate({
                path: 'patient',

                populate: {
                    path: 'user',
                    match: { distributor: { $in: decoded.id } }
                }


            })
            const confirmationHospital = await ConfirmationHospital.find({}, { _id: 1 }).populate({
                path: 'patient',

                populate: {
                    path: 'associatedhospital.id',
                    model: HospitalUser,
                    match: { distributor: { $in: decoded.id } }
                }
            })

            const dataFilterConfPatient = confirmation.filter(data => data.patient != null);
            const dataFilterConf = dataFilterConfPatient.filter(data => data.patient.user != null);

            const dataFilterConfHospitalPatient = confirmationHospital.filter(data => data.patient != null);
            const dataFilterConfHospital = dataFilterConfHospitalPatient.filter(data => data.patient.associatedhospital.id != null);

            const data = dataFilterConf.concat(dataFilterConfHospital)
            res.status(200).send({ data: data.length })
        }
    } catch (err) {
        next(err)
    }

}
exports.getTotalConfByMonth = async(req, res, next) => {
    try {

        const query = {
            "createdAt": {
                $gte: new Date((new Date().getTime() - (30 * 24 * 60 * 60 * 1000)))
            }
        };
        let token = req.headers.authorization.split(' ')[1]
        var decoded = jwt_decode(token);
        if (decoded.Role == 'Supreme Sorcerer') {
            const confirmation = await Confirmation.find(query, { _id: 1 })
            const confirmationHospital = await ConfirmationHospital.find(query, { _id: 1 })
            const data = confirmation.concat(confirmationHospital)
            res.status(200).send({ data: data.length })
        } else if (decoded.Role == 'Distributor') {
            const confirmation = await Confirmation.find(query, { _id: 1 }).populate({
                path: 'patient',

                populate: {
                    path: 'user',
                    match: { distributor: { $in: decoded.id } }
                }


            })
            const confirmationHospital = await ConfirmationHospital.find(query, { _id: 1 }).populate({
                path: 'patient',

                populate: {
                    path: 'associatedhospital.id',
                    model: HospitalUser,
                    match: { distributor: { $in: decoded.id } }
                }
            })

            const dataFilterConfPatient = confirmation.filter(data => data.patient != null);
            const dataFilterConf = dataFilterConfPatient.filter(data => data.patient.user != null);

            const dataFilterConfHospitalPatient = confirmationHospital.filter(data => data.patient != null);
            const dataFilterConfHospital = dataFilterConfHospitalPatient.filter(data => data.patient.associatedhospital.id != null);

            const data = dataFilterConf.concat(dataFilterConfHospital)
            res.status(200).send({ data: data.length })
        }
    } catch (err) {
        next(err)
    }

}
exports.getTotalOpd = async(req, res, next) => {
    try {
        let token = req.headers.authorization.split(' ')[1]
        var decoded = jwt_decode(token);
        if (decoded.Role == 'Supreme Sorcerer') {
            const opdRequest = await Opdrequest.find({}, { _id: 1 })
            const opdRequestHospital = await OpdRequestHospital.find({}, { _id: 1 })
            const data = opdRequest.concat(opdRequestHospital)
            res.status(200).send({ data: data.length })
        } else if (decoded.Role == 'Distributor') {
            const opdRequest = await Opdrequest.find({}, { _id: 1 }).populate({
                path: 'patient',

                populate: {
                    path: 'user',
                    match: { distributor: { $in: decoded.id } }
                }


            })
            const opdRequestHospital = await OpdRequestHospital.find({}, { _id: 1 }).populate({
                path: 'patient',

                populate: {
                    path: 'associatedhospital.id',
                    model: HospitalUser,
                    match: { distributor: { $in: decoded.id } }
                }
            })

            const dataFilterOpdPatient = opdRequest.filter(data => data.patient != null);
            const dataFilterOpd = dataFilterOpdPatient.filter(data => data.patient.user != null);

            const dataFilterOpdHospitalPatient = opdRequestHospital.filter(data => data.patient != null);
            const dataFilterOpdHospital = dataFilterOpdHospitalPatient.filter(data => data.patient.associatedhospital.id != null);

            const data = dataFilterOpd.concat(dataFilterOpdHospital)
            res.status(200).send({ data: data.length })
        }

    } catch (err) {
        next(err)
    }

}
exports.getTotalOpdByMonth = async(req, res, next) => {
    try {
        const query = {
            "createdAt": {
                $gte: new Date((new Date().getTime() - (30 * 24 * 60 * 60 * 1000)))
            }
        };
        let token = req.headers.authorization.split(' ')[1]
        var decoded = jwt_decode(token);
        if (decoded.Role == 'Supreme Sorcerer') {
            const opdRequest = await Opdrequest.find(query, { _id: 1 })
            const opdRequestHospital = await OpdRequestHospital.find(query, { _id: 1 })
            const data = opdRequest.concat(opdRequestHospital)
            res.status(200).send({ data: data.length })
        } else if (decoded.Role == 'Distributor') {
            const opdRequest = await Opdrequest.find(query, { _id: 1 }).populate({
                path: 'patient',

                populate: {
                    path: 'user',
                    match: { distributor: { $in: decoded.id } }
                }


            })
            const opdRequestHospital = await OpdRequestHospital.find(query, { _id: 1 }).populate({
                path: 'patient',

                populate: {
                    path: 'associatedhospital.id',
                    model: HospitalUser,
                    match: { distributor: { $in: decoded.id } }
                }
            })

            const dataFilterOpdPatient = opdRequest.filter(data => data.patient != null);
            const dataFilterOpd = dataFilterOpdPatient.filter(data => data.patient.user != null);

            const dataFilterOpdHospitalPatient = opdRequestHospital.filter(data => data.patient != null);
            const dataFilterOpdHospital = dataFilterOpdHospitalPatient.filter(data => data.patient.associatedhospital.id != null);

            const data = dataFilterOpd.concat(dataFilterOpdHospital)
            res.status(200).send({ data: data.length })
        }
    } catch (err) {
        next(err)
    }

}
exports.getTotalFacilitator = async(req, res, next) => {
    try {
        let token = req.headers.authorization.split(' ')[1]
        var decoded = jwt_decode(token);
        if (decoded.Role == 'Supreme Sorcerer') {
            const facilitator = await Facilitator.find({}, { _id: 1 })
            res.status(200).send({ data: facilitator.length })
        } else if (decoded.Role == 'Distributor') {
            const facilitator = await Facilitator.find({ distributor: { $in: decoded.id } }, { _id: 1 })
            res.status(200).send({ data: facilitator.length })
        }
    } catch (err) {
        next(err)
    }

}
exports.getTotalFacilitatorByMonth = async(req, res, next) => {
    try {
        const query = {
            "createdAt": {
                $gte: new Date((new Date().getTime() - (30 * 24 * 60 * 60 * 1000)))
            }
        };
        let token = req.headers.authorization.split(' ')[1]
        var decoded = jwt_decode(token);
        if (decoded.Role == 'Supreme Sorcerer') {
            const facilitator = await Facilitator.find(query, { _id: 1 })
            res.status(200).send({ data: facilitator.length })
        } else if (decoded.Role == 'Distributor') {
            find = {
                $and: [{
                    "createdAt": {
                        $gte: new Date((new Date().getTime() - (30 * 24 * 60 * 60 * 1000)))
                    }
                }, {
                    distributor: { $in: decoded.id }
                }]
            }
            const facilitator = await Facilitator.find(find, { _id: 1 })
            res.status(200).send({ data: facilitator.length })
        }
    } catch (err) {
        next(err)
    }

}

exports.getTotalHospitalUser = async(req, res, next) => {
    try {
        let token = req.headers.authorization.split(' ')[1]
        var decoded = jwt_decode(token);
        if (decoded.Role == 'Supreme Sorcerer') {
            const hospitalUser = await HospitalUser.find({}, { _id: 1 })
            res.status(200).send({ data: hospitalUser.length })
        } else if (decoded.Role == 'Distributor') {

            const hospitalUser = await HospitalUser.find({ distributor: { $in: decoded.id } }, { _id: 1 })
            res.status(200).send({ data: hospitalUser.length })
        }
    } catch (err) {
        next(err)
    }

}
exports.getTotalHospitalUserByMonth = async(req, res, next) => {
    try {
        const query = {
            "createdAt": {
                $gte: new Date((new Date().getTime() - (30 * 24 * 60 * 60 * 1000)))
            }
        };
        let token = req.headers.authorization.split(' ')[1]
        var decoded = jwt_decode(token);
        if (decoded.Role == 'Supreme Sorcerer') {
            const hospitalUser = await HospitalUser.find(query, { _id: 1 })
            res.status(200).send({ data: hospitalUser.length })
        } else if (decoded.Role == 'Distributor') {
            find = {
                $and: [{
                    "createdAt": {
                        $gte: new Date((new Date().getTime() - (30 * 24 * 60 * 60 * 1000)))
                    }
                }, {
                    distributor: { $in: decoded.id }
                }]
            }
            const hospitalUser = await HospitalUser.find(find, { _id: 1 })
            res.status(200).send({ data: hospitalUser.length })
        }
    } catch (err) {
        next(err)
    }

}


exports.getTotalPatientByCountry = async(req, res, next) => {
    try {
        let token = req.headers.authorization.split(' ')[1]
        var decoded = jwt_decode(token);
        if (decoded.Role == 'Supreme Sorcerer') {
            const patient = await Patient.find({}, { country: 1 })
            const patientHospital = await PatientHospital.find({}, { country: 1 })
            const data = patient.concat(patientHospital)
            const result = Object.values(data.reduce((r, e) => {
                let k = `${e.country}|${e.country}`;
                if (!r[k]) r[k] = {...e, count: 1 }
                else r[k].count += 1;
                return r;
            }, {}))
            res.status(200).send({ data: result })

        } else if (decoded.Role == 'Distributor') {
            const patient = await Patient.find({}, { country: 1 }).populate({
                path: 'user',
                match: { distributor: { $in: decoded.id } }
            })

            const patientHospital = await PatientHospital.find({}, { country: 1 }).populate({
                path: 'associatedhospital.id',
                model: HospitalUser,
                match: { distributor: { $in: decoded.id } }
            })
            const dataFilterpatient = patient.filter(data => data.user != null);
            const dataFilterHospital = patientHospital.filter(data => data.associatedhospital.id != null);

            const data = dataFilterpatient.concat(dataFilterHospital)

            const result = Object.values(data.reduce((r, e) => {
                let k = `${e.country}|${e.country}`;
                if (!r[k]) r[k] = {...e, count: 1 }
                else r[k].count += 1;
                return r;
            }, {}))
            res.status(200).send({ data: result })
        }
    } catch (err) {
        next(err)
    }

}
exports.getTotalPatientByCountryLast6Months = async(req, res, next) => {
    try {
        const query = {
            "createdAt": {
                $gte: new Date((new Date().getTime() - (180 * 24 * 60 * 60 * 1000)))
            }
        };
        let token = req.headers.authorization.split(' ')[1]
        var decoded = jwt_decode(token);
        if (decoded.Role == 'Supreme Sorcerer') {

            const patient = await Patient.find(query, { country: 1 })
            const patientHospital = await PatientHospital.find(query, { country: 1 })
            const data = patient.concat(patientHospital)
            const result = Object.values(data.reduce((r, e) => {
                let k = `${e.country}|${e.country}`;
                if (!r[k]) r[k] = {...e, count: 1 }
                else r[k].count += 1;
                return r;
            }, {}))
            res.status(200).send({ data: result })
        } else if (decoded.Role == 'Distributor') {
            const patient = await Patient.find(query, { country: 1 }).populate({
                path: 'user',
                match: { distributor: { $in: decoded.id } }
            })

            const patientHospital = await PatientHospital.find(query, { country: 1 }).populate({
                path: 'associatedhospital.id',
                model: HospitalUser,
                match: { distributor: { $in: decoded.id } }
            })
            const dataFilterpatient = patient.filter(data => data.user != null);
            const dataFilterHospital = patientHospital.filter(data => data.associatedhospital.id != null);

            const data = dataFilterpatient.concat(dataFilterHospital)

            const result = Object.values(data.reduce((r, e) => {
                let k = `${e.country}|${e.country}`;
                if (!r[k]) r[k] = {...e, count: 1 }
                else r[k].count += 1;
                return r;
            }, {}))
            res.status(200).send({ data: result })
        }
    } catch (err) {
        next(err)
    }

}

exports.getTotalPatientByCountryCurrentMonth = async(req, res, next) => {
    try {
        const query = {
            "createdAt": {
                $gte: new Date((new Date().getTime() - (30 * 24 * 60 * 60 * 1000)))
            }
        };
        let token = req.headers.authorization.split(' ')[1]
        var decoded = jwt_decode(token);
        if (decoded.Role == 'Supreme Sorcerer') {
            const patient = await Patient.find(query, { country: 1 })
            const patientHospital = await PatientHospital.find(query, { country: 1 })
            const data = patient.concat(patientHospital)
            const result = Object.values(data.reduce((r, e) => {
                let k = `${e.country}|${e.country}`;
                if (!r[k]) r[k] = {...e, count: 1 }
                else r[k].count += 1;
                return r;
            }, {}))
            res.status(200).send({ data: result })
        } else if (decoded.Role == 'Distributor') {
            const patient = await Patient.find(query, { country: 1 }).populate({
                path: 'user',
                match: { distributor: { $in: decoded.id } }
            })

            const patientHospital = await PatientHospital.find(query, { country: 1 }).populate({
                path: 'associatedhospital.id',
                model: HospitalUser,
                match: { distributor: { $in: decoded.id } }
            })
            const dataFilterpatient = patient.filter(data => data.user != null);
            const dataFilterHospital = patientHospital.filter(data => data.associatedhospital.id != null);

            const data = dataFilterpatient.concat(dataFilterHospital)

            const result = Object.values(data.reduce((r, e) => {
                let k = `${e.country}|${e.country}`;
                if (!r[k]) r[k] = {...e, count: 1 }
                else r[k].count += 1;
                return r;
            }, {}))
            res.status(200).send({ data: result })
        }
    } catch (err) {
        next(err)
    }

}

exports.getTotalVilByCountry = async(req, res, next) => {
    try {
        let token = req.headers.authorization.split(' ')[1]
        var decoded = jwt_decode(token);
        if (decoded.Role == 'Supreme Sorcerer') {
            const vil = await Vil.find({}, { patient: 1 }).populate('patient', 'country')
            const vilHospital = await VilHospital.find({}, { patient: 1 }).populate('patient', 'country')
            const data = vil.concat(vilHospital)
            const dataFilter = data.filter(data => data.patient != null);
            const result = Object.values(dataFilter.reduce((r, e) => {
                let k = `${e.patient.country}|${e.patient.country}`;
                if (!r[k]) r[k] = {...e, count: 1 }
                else r[k].count += 1;
                return r;
            }, {}))
            res.status(200).send({ data: result })
        } else if (decoded.Role == 'Distributor') {
            const vil = await Vil.find({}, { _id: 1 }).populate({
                path: 'patient',

                populate: {
                    path: 'user',
                    match: { distributor: { $in: decoded.id } }
                }


            })
            const vilHospital = await VilHospital.find({}, { _id: 1 }).populate({
                path: 'patient',
                populate: {
                    path: 'associatedhospital.id',
                    model: HospitalUser,
                    match: { distributor: { $in: decoded.id } }
                }
            })
            const dataFilterVilPatient = vil.filter(data => data.patient != null);
            const dataFilterVil = dataFilterVilPatient.filter(data => data.patient.user != null);
            const dataFilterVilHospitalPatient = vilHospital.filter(data => data.patient != null);
            const dataFilterVilHospital = dataFilterVilHospitalPatient.filter(data => data.patient.associatedhospital.id != null);

            const data = dataFilterVil.concat(dataFilterVilHospital)
            const result = Object.values(data.reduce((r, e) => {
                let k = `${e.patient.country}|${e.patient.country}`;
                if (!r[k]) r[k] = {...e, count: 1 }
                else r[k].count += 1;
                return r;
            }, {}))

            res.status(200).send({ data: result })
        }
    } catch (err) {
        next(err)
    }

}
exports.getTotalVilByCountryLast6Months = async(req, res, next) => {
    try {
        const query = {
            "createdAt": {
                $gte: new Date((new Date().getTime() - (180 * 24 * 60 * 60 * 1000)))
            }
        };
        let token = req.headers.authorization.split(' ')[1]
        var decoded = jwt_decode(token);
        if (decoded.Role == 'Supreme Sorcerer') {
            const vil = await Vil.find(query, { patient: 1 }).populate('patient', 'country')
            const vilHospital = await VilHospital.find(query, { patient: 1 }).populate('patient', 'country')
            const data = vil.concat(vilHospital)
            const dataFilter = data.filter(data => data.patient != null);
            const result = Object.values(dataFilter.reduce((r, e) => {
                let k = `${e.patient.country}|${e.patient.country}`;
                if (!r[k]) r[k] = {...e, count: 1 }
                else r[k].count += 1;
                return r;
            }, {}))
            res.status(200).send({ data: result })
        } else if (decoded.Role == 'Distributor') {
            const vil = await Vil.find(query, { _id: 1 }).populate({
                path: 'patient',

                populate: {
                    path: 'user',
                    match: { distributor: { $in: decoded.id } }
                }


            })
            const vilHospital = await VilHospital.find(query, { _id: 1 }).populate({
                path: 'patient',
                populate: {
                    path: 'associatedhospital.id',
                    model: HospitalUser,
                    match: { distributor: { $in: decoded.id } }
                }
            })
            const dataFilterVilPatient = vil.filter(data => data.patient != null);
            const dataFilterVil = dataFilterVilPatient.filter(data => data.patient.user != null);
            const dataFilterVilHospitalPatient = vilHospital.filter(data => data.patient != null);
            const dataFilterVilHospital = dataFilterVilHospitalPatient.filter(data => data.patient.associatedhospital.id != null);

            const data = dataFilterVil.concat(dataFilterVilHospital)
            const result = Object.values(data.reduce((r, e) => {
                let k = `${e.patient.country}|${e.patient.country}`;
                if (!r[k]) r[k] = {...e, count: 1 }
                else r[k].count += 1;
                return r;
            }, {}))

            res.status(200).send({ data: result })
        }
    } catch (err) {
        next(err)
    }

}

exports.getTotalVilByCountryCurrentMonth = async(req, res, next) => {
    try {
        const query = {
            "createdAt": {
                $gte: new Date((new Date().getTime() - (30 * 24 * 60 * 60 * 1000)))
            }
        };
        let token = req.headers.authorization.split(' ')[1]
        var decoded = jwt_decode(token);
        if (decoded.Role == 'Supreme Sorcerer') {
            const vil = await Vil.find(query, { patient: 1 }).populate('patient', 'country')
            const vilHospital = await VilHospital.find(query, { patient: 1 }).populate('patient', 'country')
            const data = vil.concat(vilHospital)
            const dataFilter = data.filter(data => data.patient != null);
            const result = Object.values(dataFilter.reduce((r, e) => {
                let k = `${e.patient.country}|${e.patient.country}`;
                if (!r[k]) r[k] = {...e, count: 1 }
                else r[k].count += 1;
                return r;
            }, {}))

            res.status(200).send({ data: result })
        } else if (decoded.Role == 'Distributor') {
            const vil = await Vil.find(query, { _id: 1 }).populate({
                path: 'patient',

                populate: {
                    path: 'user',
                    match: { distributor: { $in: decoded.id } }
                }


            })
            const vilHospital = await VilHospital.find(query, { _id: 1 }).populate({
                path: 'patient',
                populate: {
                    path: 'associatedhospital.id',
                    model: HospitalUser,
                    match: { distributor: { $in: decoded.id } }
                }
            })
            const dataFilterVilPatient = vil.filter(data => data.patient != null);
            const dataFilterVil = dataFilterVilPatient.filter(data => data.patient.user != null);
            const dataFilterVilHospitalPatient = vilHospital.filter(data => data.patient != null);
            const dataFilterVilHospital = dataFilterVilHospitalPatient.filter(data => data.patient.associatedhospital.id != null);

            const data = dataFilterVil.concat(dataFilterVilHospital)
            const result = Object.values(data.reduce((r, e) => {
                let k = `${e.patient.country}|${e.patient.country}`;
                if (!r[k]) r[k] = {...e, count: 1 }
                else r[k].count += 1;
                return r;
            }, {}))

            res.status(200).send({ data: result })
        }
    } catch (err) {
        next(err)
    }

}

exports.getTotalConfByCountry = async(req, res, next) => {
    try {
        let token = req.headers.authorization.split(' ')[1]
        var decoded = jwt_decode(token);
        if (decoded.Role == 'Supreme Sorcerer') {
            const confirmation = await Confirmation.find({}, { patient: 1 }).populate('patient', 'country')
            const confirmationHospital = await ConfirmationHospital.find({}, { patient: 1 }).populate('patient', 'country')
            const data = confirmation.concat(confirmationHospital)
            const dataFilter = data.filter(data => data.patient != null);
            const result = Object.values(dataFilter.reduce((r, e) => {
                let k = `${e.patient.country}|${e.patient.country}`;
                if (!r[k]) r[k] = {...e, count: 1 }
                else r[k].count += 1;
                return r;
            }, {}))
            res.status(200).send({ data: result })
        } else if (decoded.Role == 'Distributor') {
            const confirmation = await Confirmation.find({}, { _id: 1 }).populate({
                path: 'patient',

                populate: {
                    path: 'user',
                    match: { distributor: { $in: decoded.id } }
                }


            })
            const confirmationHospital = await ConfirmationHospital.find({}, { _id: 1 }).populate({
                path: 'patient',

                populate: {
                    path: 'associatedhospital.id',
                    model: HospitalUser,
                    match: { distributor: { $in: decoded.id } }
                }
            })

            const dataFilterConfPatient = confirmation.filter(data => data.patient != null);
            const dataFilterConf = dataFilterConfPatient.filter(data => data.patient.user != null);

            const dataFilterConfHospitalPatient = confirmationHospital.filter(data => data.patient != null);
            const dataFilterConfHospital = dataFilterConfHospitalPatient.filter(data => data.patient.associatedhospital.id != null);

            const data = dataFilterConf.concat(dataFilterConfHospital)
            const result = Object.values(data.reduce((r, e) => {
                let k = `${e.patient.country}|${e.patient.country}`;
                if (!r[k]) r[k] = {...e, count: 1 }
                else r[k].count += 1;
                return r;
            }, {}))

            res.status(200).send({ data: result })
        }
    } catch (err) {
        next(err)
    }

}
exports.getTotalConfByCountryLast6Months = async(req, res, next) => {
    try {
        const query = {
            "createdAt": {
                $gte: new Date((new Date().getTime() - (180 * 24 * 60 * 60 * 1000)))
            }
        };
        let token = req.headers.authorization.split(' ')[1]
        var decoded = jwt_decode(token);
        if (decoded.Role == 'Supreme Sorcerer') {
            const confirmation = await Confirmation.find(query, { patient: 1 }).populate('patient', 'country')
            const confirmationHospital = await ConfirmationHospital.find(query, { patient: 1 }).populate('patient', 'country')
            const data = confirmation.concat(confirmationHospital)
            const dataFilter = data.filter(data => data.patient != null);
            const result = Object.values(dataFilter.reduce((r, e) => {
                let k = `${e.patient.country}|${e.patient.country}`;
                if (!r[k]) r[k] = {...e, count: 1 }
                else r[k].count += 1;
                return r;
            }, {}))
            res.status(200).send({ data: result })
        } else if (decoded.Role == 'Distributor') {
            const confirmation = await Confirmation.find(query, { _id: 1 }).populate({
                path: 'patient',

                populate: {
                    path: 'user',
                    match: { distributor: { $in: decoded.id } }
                }


            })
            const confirmationHospital = await ConfirmationHospital.find(query, { _id: 1 }).populate({
                path: 'patient',

                populate: {
                    path: 'associatedhospital.id',
                    model: HospitalUser,
                    match: { distributor: { $in: decoded.id } }
                }
            })

            const dataFilterConfPatient = confirmation.filter(data => data.patient != null);
            const dataFilterConf = dataFilterConfPatient.filter(data => data.patient.user != null);

            const dataFilterConfHospitalPatient = confirmationHospital.filter(data => data.patient != null);
            const dataFilterConfHospital = dataFilterConfHospitalPatient.filter(data => data.patient.associatedhospital.id != null);

            const data = dataFilterConf.concat(dataFilterConfHospital)
            const result = Object.values(data.reduce((r, e) => {
                let k = `${e.patient.country}|${e.patient.country}`;
                if (!r[k]) r[k] = {...e, count: 1 }
                else r[k].count += 1;
                return r;
            }, {}))

            res.status(200).send({ data: result })
        }
    } catch (err) {
        next(err)
    }

}

exports.getTotalConfByCountryCurrentMonth = async(req, res, next) => {
    try {
        const query = {
            "createdAt": {
                $gte: new Date((new Date().getTime() - (30 * 24 * 60 * 60 * 1000)))
            }
        };
        let token = req.headers.authorization.split(' ')[1]
        var decoded = jwt_decode(token);
        if (decoded.Role == 'Supreme Sorcerer') {
            const confirmation = await Confirmation.find(query, { patient: 1 }).populate('patient', 'country')
            const confirmationHospital = await ConfirmationHospital.find(query, { patient: 1 }).populate('patient', 'country')
            const data = confirmation.concat(confirmationHospital)
            const dataFilter = data.filter(data => data.patient != null);
            const result = Object.values(dataFilter.reduce((r, e) => {
                let k = `${e.patient.country}|${e.patient.country}`;
                if (!r[k]) r[k] = {...e, count: 1 }
                else r[k].count += 1;
                return r;
            }, {}))
            res.status(200).send({ data: result })
        } else if (decoded.Role == 'Distributor') {
            const confirmation = await Confirmation.find(query, { _id: 1 }).populate({
                path: 'patient',

                populate: {
                    path: 'user',
                    match: { distributor: { $in: decoded.id } }
                }


            })
            const confirmationHospital = await ConfirmationHospital.find(query, { _id: 1 }).populate({
                path: 'patient',

                populate: {
                    path: 'associatedhospital.id',
                    model: HospitalUser,
                    match: { distributor: { $in: decoded.id } }
                }
            })

            const dataFilterConfPatient = confirmation.filter(data => data.patient != null);
            const dataFilterConf = dataFilterConfPatient.filter(data => data.patient.user != null);

            const dataFilterConfHospitalPatient = confirmationHospital.filter(data => data.patient != null);
            const dataFilterConfHospital = dataFilterConfHospitalPatient.filter(data => data.patient.associatedhospital.id != null);

            const data = dataFilterConf.concat(dataFilterConfHospital)
            const result = Object.values(data.reduce((r, e) => {
                let k = `${e.patient.country}|${e.patient.country}`;
                if (!r[k]) r[k] = {...e, count: 1 }
                else r[k].count += 1;
                return r;
            }, {}))

            res.status(200).send({ data: result })
        }
    } catch (err) {
        next(err)
    }

}

exports.getTotalPatientByTreatment = async(req, res, next) => {
    try {
        let token = req.headers.authorization.split(' ')[1]
        var decoded = jwt_decode(token);
        if (decoded.Role == 'Supreme Sorcerer') {
            const patient = await Patient.find({}, { treatment: 1 })
            const patientHospital = await PatientHospital.find({}, { treatment: 1 })
            const data = patient.concat(patientHospital)
            const result = Object.values(data.reduce((r, e) => {
                let k = `${e.treatment}|${e.treatment}`;
                if (!r[k]) r[k] = {...e, count: 1 }
                else r[k].count += 1;
                return r;
            }, {}))
            res.status(200).send({ data: result })
        } else if (decoded.Role == 'Distributor') {
            const patient = await Patient.find({}, { treatment: 1 }).populate({
                path: 'user',
                match: { distributor: { $in: decoded.id } }
            })

            const patientHospital = await PatientHospital.find({}, { treatment: 1 }).populate({
                path: 'associatedhospital.id',
                model: HospitalUser,
                match: { distributor: { $in: decoded.id } }
            })
            const dataFilterpatient = patient.filter(data => data.user != null);
            const dataFilterHospital = patientHospital.filter(data => data.associatedhospital.id != null);

            const data = dataFilterpatient.concat(dataFilterHospital)

            const result = Object.values(data.reduce((r, e) => {
                let k = `${e.treatment}|${e.treatment}`;
                if (!r[k]) r[k] = {...e, count: 1 }
                else r[k].count += 1;
                return r;
            }, {}))
            res.status(200).send({ data: result })
        }
    } catch (err) {
        next(err)
    }

}
exports.getTotalPatientByTreatmentLast6Months = async(req, res, next) => {
    try {
        const query = {
            "createdAt": {
                $gte: new Date((new Date().getTime() - (180 * 24 * 60 * 60 * 1000)))
            }
        };
        let token = req.headers.authorization.split(' ')[1]
        var decoded = jwt_decode(token);
        if (decoded.Role == 'Supreme Sorcerer') {
            const patient = await Patient.find(query, { treatment: 1 })
            const patientHospital = await PatientHospital.find(query, { treatment: 1 })
            const data = patient.concat(patientHospital)
            const result = Object.values(data.reduce((r, e) => {
                let k = `${e.treatment}|${e.treatment}`;
                if (!r[k]) r[k] = {...e, count: 1 }
                else r[k].count += 1;
                return r;
            }, {}))
            res.status(200).send({ data: result })
        } else if (decoded.Role == 'Distributor') {
            const patient = await Patient.find(query, { treatment: 1 }).populate({
                path: 'user',
                match: { distributor: { $in: decoded.id } }
            })

            const patientHospital = await PatientHospital.find(query, { treatment: 1 }).populate({
                path: 'associatedhospital.id',
                model: HospitalUser,
                match: { distributor: { $in: decoded.id } }
            })
            const dataFilterpatient = patient.filter(data => data.user != null);
            const dataFilterHospital = patientHospital.filter(data => data.associatedhospital.id != null);

            const data = dataFilterpatient.concat(dataFilterHospital)

            const result = Object.values(data.reduce((r, e) => {
                let k = `${e.treatment}|${e.treatment}`;
                if (!r[k]) r[k] = {...e, count: 1 }
                else r[k].count += 1;
                return r;
            }, {}))
            res.status(200).send({ data: result })
        }
    } catch (err) {
        next(err)
    }

}

exports.getTotalPatientByTreatmentCurrentMonth = async(req, res, next) => {
    try {
        const query = {
            "createdAt": {
                $gte: new Date((new Date().getTime() - (30 * 24 * 60 * 60 * 1000)))
            }
        };
        let token = req.headers.authorization.split(' ')[1]
        var decoded = jwt_decode(token);
        if (decoded.Role == 'Supreme Sorcerer') {
            const patient = await Patient.find(query, { treatment: 1 })
            const patientHospital = await PatientHospital.find(query, { treatment: 1 })
            const data = patient.concat(patientHospital)
            const result = Object.values(data.reduce((r, e) => {
                let k = `${e.treatment}|${e.treatment}`;
                if (!r[k]) r[k] = {...e, count: 1 }
                else r[k].count += 1;
                return r;
            }, {}))
            res.status(200).send({ data: result })
        } else if (decoded.Role == 'Distributor') {
            const patient = await Patient.find(query, { treatment: 1 }).populate({
                path: 'user',
                match: { distributor: { $in: decoded.id } }
            })

            const patientHospital = await PatientHospital.find(query, { treatment: 1 }).populate({
                path: 'associatedhospital.id',
                model: HospitalUser,
                match: { distributor: { $in: decoded.id } }
            })
            const dataFilterpatient = patient.filter(data => data.user != null);
            const dataFilterHospital = patientHospital.filter(data => data.associatedhospital.id != null);

            const data = dataFilterpatient.concat(dataFilterHospital)

            const result = Object.values(data.reduce((r, e) => {
                let k = `${e.treatment}|${e.treatment}`;
                if (!r[k]) r[k] = {...e, count: 1 }
                else r[k].count += 1;
                return r;
            }, {}))
            res.status(200).send({ data: result })
        }
    } catch (err) {
        next(err)
    }

}

exports.getTotalVilByTreatment = async(req, res, next) => {
    try {
        let token = req.headers.authorization.split(' ')[1]
        var decoded = jwt_decode(token);
        if (decoded.Role == 'Supreme Sorcerer') {
            const vil = await Vil.find({}, { patient: 1 }).populate('patient', 'treatment')
            const vilHospital = await VilHospital.find({}, { patient: 1 }).populate('patient', 'treatment')
            const data = vil.concat(vilHospital)
            const dataFilter = data.filter(data => data.patient != null);
            const result = Object.values(dataFilter.reduce((r, e) => {
                let k = `${e.patient.treatment}|${e.patient.treatment}`;
                if (!r[k]) r[k] = {...e, count: 1 }
                else r[k].count += 1;
                return r;
            }, {}))
            res.status(200).send({ data: result })
        } else if (decoded.Role == 'Distributor') {
            const vil = await Vil.find({}, { _id: 1 }).populate({
                path: 'patient',

                populate: {
                    path: 'user',
                    match: { distributor: { $in: decoded.id } }
                }


            })
            const vilHospital = await VilHospital.find({}, { _id: 1 }).populate({
                path: 'patient',
                populate: {
                    path: 'associatedhospital.id',
                    model: HospitalUser,
                    match: { distributor: { $in: decoded.id } }
                }
            })
            const dataFilterVilPatient = vil.filter(data => data.patient != null);
            const dataFilterVil = dataFilterVilPatient.filter(data => data.patient.user != null);
            const dataFilterVilHospitalPatient = vilHospital.filter(data => data.patient != null);
            const dataFilterVilHospital = dataFilterVilHospitalPatient.filter(data => data.patient.associatedhospital.id != null);

            const data = dataFilterVil.concat(dataFilterVilHospital)
            const result = Object.values(data.reduce((r, e) => {
                let k = `${e.patient.treatment}|${e.patient.treatment}`;
                if (!r[k]) r[k] = {...e, count: 1 }
                else r[k].count += 1;
                return r;
            }, {}))

            res.status(200).send({ data: result })
        }
    } catch (err) {
        next(err)
    }

}
exports.getTotalVilByTreatmentLast6Months = async(req, res, next) => {
    try {
        const query = {
            "createdAt": {
                $gte: new Date((new Date().getTime() - (180 * 24 * 60 * 60 * 1000)))
            }
        };
        let token = req.headers.authorization.split(' ')[1]
        var decoded = jwt_decode(token);
        if (decoded.Role == 'Supreme Sorcerer') {
            const vil = await Vil.find(query, { patient: 1 }).populate('patient', 'treatment')
            const vilHospital = await VilHospital.find(query, { patient: 1 }).populate('patient', 'treatment')
            const data = vil.concat(vilHospital)
            const dataFilter = data.filter(data => data.patient != null);
            const result = Object.values(dataFilter.reduce((r, e) => {
                let k = `${e.patient.treatment}|${e.patient.treatment}`;
                if (!r[k]) r[k] = {...e, count: 1 }
                else r[k].count += 1;
                return r;
            }, {}))
            res.status(200).send({ data: result })
        } else if (decoded.Role == 'Distributor') {
            const vil = await Vil.find(query, { _id: 1 }).populate({
                path: 'patient',

                populate: {
                    path: 'user',
                    match: { distributor: { $in: decoded.id } }
                }


            })
            const vilHospital = await VilHospital.find(query, { _id: 1 }).populate({
                path: 'patient',
                populate: {
                    path: 'associatedhospital.id',
                    model: HospitalUser,
                    match: { distributor: { $in: decoded.id } }
                }
            })
            const dataFilterVilPatient = vil.filter(data => data.patient != null);
            const dataFilterVil = dataFilterVilPatient.filter(data => data.patient.user != null);
            const dataFilterVilHospitalPatient = vilHospital.filter(data => data.patient != null);
            const dataFilterVilHospital = dataFilterVilHospitalPatient.filter(data => data.patient.associatedhospital.id != null);

            const data = dataFilterVil.concat(dataFilterVilHospital)
            const result = Object.values(data.reduce((r, e) => {
                let k = `${e.patient.treatment}|${e.patient.treatment}`;
                if (!r[k]) r[k] = {...e, count: 1 }
                else r[k].count += 1;
                return r;
            }, {}))

            res.status(200).send({ data: result })
        }
    } catch (err) {
        next(err)
    }

}

exports.getTotalVilByTreatmentCurrentMonth = async(req, res, next) => {
    try {
        const query = {
            "createdAt": {
                $gte: new Date((new Date().getTime() - (30 * 24 * 60 * 60 * 1000)))
            }
        };
        let token = req.headers.authorization.split(' ')[1]
        var decoded = jwt_decode(token);
        if (decoded.Role == 'Supreme Sorcerer') {
            const vil = await Vil.find(query, { patient: 1 }).populate('patient', 'treatment')
            const vilHospital = await VilHospital.find(query, { patient: 1 }).populate('patient', 'treatment')
            const data = vil.concat(vilHospital)
            const dataFilter = data.filter(data => data.patient != null);
            const result = Object.values(dataFilter.reduce((r, e) => {
                let k = `${e.patient.treatment}|${e.patient.treatment}`;
                if (!r[k]) r[k] = {...e, count: 1 }
                else r[k].count += 1;
                return r;
            }, {}))
            res.status(200).send({ data: result })
        } else if (decoded.Role == 'Distributor') {
            const vil = await Vil.find(query, { _id: 1 }).populate({
                path: 'patient',

                populate: {
                    path: 'user',
                    match: { distributor: { $in: decoded.id } }
                }


            })
            const vilHospital = await VilHospital.find(query, { _id: 1 }).populate({
                path: 'patient',
                populate: {
                    path: 'associatedhospital.id',
                    model: HospitalUser,
                    match: { distributor: { $in: decoded.id } }
                }
            })
            const dataFilterVilPatient = vil.filter(data => data.patient != null);
            const dataFilterVil = dataFilterVilPatient.filter(data => data.patient.user != null);
            const dataFilterVilHospitalPatient = vilHospital.filter(data => data.patient != null);
            const dataFilterVilHospital = dataFilterVilHospitalPatient.filter(data => data.patient.associatedhospital.id != null);

            const data = dataFilterVil.concat(dataFilterVilHospital)
            const result = Object.values(data.reduce((r, e) => {
                let k = `${e.patient.treatment}|${e.patient.treatment}`;
                if (!r[k]) r[k] = {...e, count: 1 }
                else r[k].count += 1;
                return r;
            }, {}))

            res.status(200).send({ data: result })
        }
    } catch (err) {
        next(err)
    }

}

exports.getTotalConfByTreatment = async(req, res, next) => {
    try {
        let token = req.headers.authorization.split(' ')[1]
        var decoded = jwt_decode(token);
        if (decoded.Role == 'Supreme Sorcerer') {
            const confirmation = await Confirmation.find({}, { patient: 1 }).populate('patient', 'treatment')
            const confirmationHospital = await ConfirmationHospital.find({}, { patient: 1 }).populate('patient', 'treatment')
            const data = confirmation.concat(confirmationHospital)
            const dataFilter = data.filter(data => data.patient != null);
            const result = Object.values(dataFilter.reduce((r, e) => {
                let k = `${e.patient.treatment}|${e.patient.treatment}`;
                if (!r[k]) r[k] = {...e, count: 1 }
                else r[k].count += 1;
                return r;
            }, {}))
            res.status(200).send({ data: result })
        } else if (decoded.Role == 'Distributor') {
            const confirmation = await Confirmation.find({}, { _id: 1 }).populate({
                path: 'patient',

                populate: {
                    path: 'user',
                    match: { distributor: { $in: decoded.id } }
                }


            })
            const confirmationHospital = await ConfirmationHospital.find({}, { _id: 1 }).populate({
                path: 'patient',

                populate: {
                    path: 'associatedhospital.id',
                    model: HospitalUser,
                    match: { distributor: { $in: decoded.id } }
                }
            })

            const dataFilterConfPatient = confirmation.filter(data => data.patient != null);
            const dataFilterConf = dataFilterConfPatient.filter(data => data.patient.user != null);

            const dataFilterConfHospitalPatient = confirmationHospital.filter(data => data.patient != null);
            const dataFilterConfHospital = dataFilterConfHospitalPatient.filter(data => data.patient.associatedhospital.id != null);

            const data = dataFilterConf.concat(dataFilterConfHospital)
            const result = Object.values(data.reduce((r, e) => {
                let k = `${e.patient.treatment}|${e.patient.treatment}`;
                if (!r[k]) r[k] = {...e, count: 1 }
                else r[k].count += 1;
                return r;
            }, {}))

            res.status(200).send({ data: result })
        }
    } catch (err) {
        next(err)
    }

}
exports.getTotalConfByTreatmentLast6Months = async(req, res, next) => {
    try {
        const query = {
            "createdAt": {
                $gte: new Date((new Date().getTime() - (180 * 24 * 60 * 60 * 1000)))
            }
        };
        let token = req.headers.authorization.split(' ')[1]
        var decoded = jwt_decode(token);
        if (decoded.Role == 'Supreme Sorcerer') {
            const confirmation = await Confirmation.find(query, { patient: 1 }).populate('patient', 'treatment')
            const confirmationHospital = await ConfirmationHospital.find({}, { patient: 1 }).populate('patient', 'treatment')
            const data = confirmation.concat(confirmationHospital)
            const dataFilter = data.filter(data => data.patient != null);
            const result = Object.values(dataFilter.reduce((r, e) => {
                let k = `${e.patient.treatment}|${e.patient.treatment}`;
                if (!r[k]) r[k] = {...e, count: 1 }
                else r[k].count += 1;
                return r;
            }, {}))
            res.status(200).send({ data: result })
        } else if (decoded.Role == 'Distributor') {
            const confirmation = await Confirmation.find(query, { _id: 1 }).populate({
                path: 'patient',

                populate: {
                    path: 'user',
                    match: { distributor: { $in: decoded.id } }
                }


            })
            const confirmationHospital = await ConfirmationHospital.find(query, { _id: 1 }).populate({
                path: 'patient',

                populate: {
                    path: 'associatedhospital.id',
                    model: HospitalUser,
                    match: { distributor: { $in: decoded.id } }
                }
            })

            const dataFilterConfPatient = confirmation.filter(data => data.patient != null);
            const dataFilterConf = dataFilterConfPatient.filter(data => data.patient.user != null);

            const dataFilterConfHospitalPatient = confirmationHospital.filter(data => data.patient != null);
            const dataFilterConfHospital = dataFilterConfHospitalPatient.filter(data => data.patient.associatedhospital.id != null);

            const data = dataFilterConf.concat(dataFilterConfHospital)
            const result = Object.values(data.reduce((r, e) => {
                let k = `${e.patient.treatment}|${e.patient.treatment}`;
                if (!r[k]) r[k] = {...e, count: 1 }
                else r[k].count += 1;
                return r;
            }, {}))

            res.status(200).send({ data: result })
        }
    } catch (err) {
        next(err)
    }

}

exports.getTotalConfByTreatmentCurrentMonth = async(req, res, next) => {
    try {
        const query = {
            "createdAt": {
                $gte: new Date((new Date().getTime() - (30 * 24 * 60 * 60 * 1000)))
            }
        };
        let token = req.headers.authorization.split(' ')[1]
        var decoded = jwt_decode(token);
        if (decoded.Role == 'Supreme Sorcerer') {
            const confirmation = await Confirmation.find(query, { patient: 1 }).populate('patient', 'treatment')
            const confirmationHospital = await ConfirmationHospital.find({}, { patient: 1 }).populate('patient', 'treatment')
            const data = confirmation.concat(confirmationHospital)
            const dataFilter = data.filter(data => data.patient != null);
            const result = Object.values(dataFilter.reduce((r, e) => {
                let k = `${e.patient.treatment}|${e.patient.treatment}`;
                if (!r[k]) r[k] = {...e, count: 1 }
                else r[k].count += 1;
                return r;
            }, {}))
            res.status(200).send({ data: result })
        } else if (decoded.Role == 'Distributor') {
            const confirmation = await Confirmation.find(query, { _id: 1 }).populate({
                path: 'patient',

                populate: {
                    path: 'user',
                    match: { distributor: { $in: decoded.id } }
                }


            })
            const confirmationHospital = await ConfirmationHospital.find(query, { _id: 1 }).populate({
                path: 'patient',

                populate: {
                    path: 'associatedhospital.id',
                    model: HospitalUser,
                    match: { distributor: { $in: decoded.id } }
                }
            })

            const dataFilterConfPatient = confirmation.filter(data => data.patient != null);
            const dataFilterConf = dataFilterConfPatient.filter(data => data.patient.user != null);

            const dataFilterConfHospitalPatient = confirmationHospital.filter(data => data.patient != null);
            const dataFilterConfHospital = dataFilterConfHospitalPatient.filter(data => data.patient.associatedhospital.id != null);

            const data = dataFilterConf.concat(dataFilterConfHospital)
            const result = Object.values(data.reduce((r, e) => {
                let k = `${e.patient.treatment}|${e.patient.treatment}`;
                if (!r[k]) r[k] = {...e, count: 1 }
                else r[k].count += 1;
                return r;
            }, {}))

            res.status(200).send({ data: result })
        }
    } catch (err) {
        next(err)
    }

}

exports.getDataLast6Months = async(req, res, next) => {
    try {
        let token = req.headers.authorization.split(' ')[1]
        var decoded = jwt_decode(token);
        const todayDate = new Date()
        const sixFromNow = new Date()
        sixFromNow.setMonth(todayDate.getMonth() - 6)

        find = {
            createdAt: {
                $gt: sixFromNow,
                $lt: todayDate
            },
        }
        if (decoded.Role == 'Supreme Sorcerer') {

            patient = await Patient.find(find, { createdAt: 1 }).lean()
            patientHospital = await PatientHospital.find(find, { createdAt: 1 }).lean()
            const dataPatient = patient.concat(patientHospital)
            dataPatient.map(obj => {
                obj['createdAt'] = obj.createdAt.getMonth() + 1
            })
            dataPatient.map(obj => {
                if (obj.createdAt == '01') {
                    obj['month'] = 'January'
                } else if (obj.createdAt == '02') {
                    obj['month'] = 'February'
                } else if (obj.createdAt == '03') {
                    obj['month'] = 'March'
                } else if (obj.createdAt == '04') {
                    obj['month'] = 'April'
                } else if (obj.createdAt == '05') {
                    obj['month'] = 'May'
                } else if (obj.createdAt == '06') {
                    obj['month'] = 'June'
                } else if (obj.createdAt == '07') {
                    obj['month'] = 'July'
                } else if (obj.createdAt == '08') {
                    obj['month'] = 'August'
                } else if (obj.createdAt == '09') {
                    obj['month'] = 'September'
                } else if (obj.createdAt == '10') {
                    obj['month'] = 'October'
                } else if (obj.createdAt == '11') {
                    obj['month'] = 'November'
                } else if (obj.createdAt == '12') {
                    obj['month'] = 'December'
                }
            })
            const result = Object.values(dataPatient.reduce((r, e) => {
                let k = `${e.month}|${e.month}`;
                if (!r[k]) r[k] = {...e, count: 1 }
                else r[k].count += 1;
                return r;
            }, {}))

            res.status(200).send({ data: result })
        } else if (decoded.Role == 'Distributor') {
            const patient = await Patient.find(find, { createdAt: 1 }).populate({
                path: 'user',
                match: { distributor: { $in: decoded.id } }
            }).lean()

            const patientHospital = await PatientHospital.find(find, { createdAt: 1 }).populate({
                path: 'associatedhospital.id',
                model: HospitalUser,
                match: { distributor: { $in: decoded.id } }
            }).lean()
            const dataFilterpatient = patient.filter(data => data.user != null);
            const dataFilterHospital = patientHospital.filter(data => data.associatedhospital.id != null);

            const data = dataFilterpatient.concat(dataFilterHospital)

            data.map(obj => {
                obj['createdAt'] = obj.createdAt.getMonth() + 1
            })
            data.map(obj => {
                if (obj.createdAt == '01') {
                    obj['month'] = 'January'
                } else if (obj.createdAt == '02') {
                    obj['month'] = 'February'
                } else if (obj.createdAt == '03') {
                    obj['month'] = 'March'
                } else if (obj.createdAt == '04') {
                    obj['month'] = 'April'
                } else if (obj.createdAt == '05') {
                    obj['month'] = 'May'
                } else if (obj.createdAt == '06') {
                    obj['month'] = 'June'
                } else if (obj.createdAt == '07') {
                    obj['month'] = 'July'
                } else if (obj.createdAt == '08') {
                    obj['month'] = 'August'
                } else if (obj.createdAt == '09') {
                    obj['month'] = 'September'
                } else if (obj.createdAt == '10') {
                    obj['month'] = 'October'
                } else if (obj.createdAt == '11') {
                    obj['month'] = 'November'
                } else if (obj.createdAt == '12') {
                    obj['month'] = 'December'
                }
            })
            const result = Object.values(data.reduce((r, e) => {
                let k = `${e.month}|${e.month}`;
                if (!r[k]) r[k] = {...e, count: 1 }
                else r[k].count += 1;
                return r;
            }, {}))

            res.status(200).send({ data: result })
        }
    } catch (err) {
        next(err)
    }

}

exports.getDataLast6MonthsVil = async(req, res, next) => {
    try {

        const todayDate = new Date()
        const sixFromNow = new Date()
        sixFromNow.setMonth(todayDate.getMonth() - 6)
        let token = req.headers.authorization.split(' ')[1]
        var decoded = jwt_decode(token);


        find = {
            createdAt: {
                $gt: sixFromNow,
                $lt: todayDate
            },
        }
        if (decoded.Role == 'Supreme Sorcerer') {

            const vil = await Vil.find(find, { createdAt: 1 }).lean()
            const vilHospital = await VilHospital.find(find, { createdAt: 1 }).lean()
            const dataVil = vil.concat(vilHospital)
            dataVil.map(obj => {
                obj['createdAt'] = obj.createdAt.getMonth() + 1
            })
            dataVil.map(obj => {
                if (obj.createdAt == '01') {
                    obj['month'] = 'January'
                } else if (obj.createdAt == '02') {
                    obj['month'] = 'February'
                } else if (obj.createdAt == '03') {
                    obj['month'] = 'March'
                } else if (obj.createdAt == '04') {
                    obj['month'] = 'April'
                } else if (obj.createdAt == '05') {
                    obj['month'] = 'May'
                } else if (obj.createdAt == '06') {
                    obj['month'] = 'June'
                } else if (obj.createdAt == '07') {
                    obj['month'] = 'July'
                } else if (obj.createdAt == '08') {
                    obj['month'] = 'August'
                } else if (obj.createdAt == '09') {
                    obj['month'] = 'September'
                } else if (obj.createdAt == '10') {
                    obj['month'] = 'October'
                } else if (obj.createdAt == '11') {
                    obj['month'] = 'November'
                } else if (obj.createdAt == '12') {
                    obj['month'] = 'December'
                }
            })
            const result = Object.values(dataVil.reduce((r, e) => {
                let k = `${e.month}|${e.month}`;
                if (!r[k]) r[k] = {...e, count: 1 }
                else r[k].count += 1;
                return r;
            }, {}))
            res.status(200).send({ data: result })
        } else if (decoded.Role == 'Distributor') {
            const vil = await Vil.find(find, { createdAt: 1 }).populate({
                path: 'patient',

                populate: {
                    path: 'user',
                    match: { distributor: { $in: decoded.id } }
                }


            }).lean()
            const vilHospital = await VilHospital.find(find, { createdAt: 1 }).populate({
                path: 'patient',

                populate: {
                    path: 'associatedhospital.id',
                    model: HospitalUser,
                    match: { distributor: { $in: decoded.id } }
                }
            }).lean()
            const dataFilterVilPatient = vil.filter(data => data.patient != null);
            const dataFilterVil = dataFilterVilPatient.filter(data => data.patient.user != null);
            const dataFilterVilHospitalPatient = vilHospital.filter(data => data.patient != null);
            const dataFilterVilHospital = dataFilterVilHospitalPatient.filter(data => data.patient.associatedhospital.id != null);

            const data = dataFilterVil.concat(dataFilterVilHospital)
            data.map(obj => {
                obj['createdAt'] = obj.createdAt.getMonth() + 1
            })
            data.map(obj => {
                if (obj.createdAt == '01') {
                    obj['month'] = 'January'
                } else if (obj.createdAt == '02') {
                    obj['month'] = 'February'
                } else if (obj.createdAt == '03') {
                    obj['month'] = 'March'
                } else if (obj.createdAt == '04') {
                    obj['month'] = 'April'
                } else if (obj.createdAt == '05') {
                    obj['month'] = 'May'
                } else if (obj.createdAt == '06') {
                    obj['month'] = 'June'
                } else if (obj.createdAt == '07') {
                    obj['month'] = 'July'
                } else if (obj.createdAt == '08') {
                    obj['month'] = 'August'
                } else if (obj.createdAt == '09') {
                    obj['month'] = 'September'
                } else if (obj.createdAt == '10') {
                    obj['month'] = 'October'
                } else if (obj.createdAt == '11') {
                    obj['month'] = 'November'
                } else if (obj.createdAt == '12') {
                    obj['month'] = 'December'
                }
            })
            const result = Object.values(data.reduce((r, e) => {
                let k = `${e.month}|${e.month}`;
                if (!r[k]) r[k] = {...e, count: 1 }
                else r[k].count += 1;
                return r;
            }, {}))
            res.status(200).send({ data: result })
        }
    } catch (err) {
        next(err)
    }

}

exports.getDataLast6MonthsConf = async(req, res, next) => {
    try {
        const todayDate = new Date()
        const sixFromNow = new Date()
        sixFromNow.setMonth(todayDate.getMonth() - 6)
        let token = req.headers.authorization.split(' ')[1]
        var decoded = jwt_decode(token);

        if (decoded.Role == 'Supreme Sorcerer') {
            const confirmation = await Confirmation.find(find, { createdAt: 1 }).lean()
            const confirmationHospital = await ConfirmationHospital.find(find, { createdAt: 1 }).lean()
            const dataConf = confirmation.concat(confirmationHospital)
            dataConf.map(obj => {
                obj['createdAt'] = obj.createdAt.getMonth() + 1
            })
            dataConf.map(obj => {
                if (obj.createdAt == '01') {
                    obj['month'] = 'January'
                } else if (obj.createdAt == '02') {
                    obj['month'] = 'February'
                } else if (obj.createdAt == '03') {
                    obj['month'] = 'March'
                } else if (obj.createdAt == '04') {
                    obj['month'] = 'April'
                } else if (obj.createdAt == '05') {
                    obj['month'] = 'May'
                } else if (obj.createdAt == '06') {
                    obj['month'] = 'June'
                } else if (obj.createdAt == '07') {
                    obj['month'] = 'July'
                } else if (obj.createdAt == '08') {
                    obj['month'] = 'August'
                } else if (obj.createdAt == '09') {
                    obj['month'] = 'September'
                } else if (obj.createdAt == '10') {
                    obj['month'] = 'October'
                } else if (obj.createdAt == '11') {
                    obj['month'] = 'November'
                } else if (obj.createdAt == '12') {
                    obj['month'] = 'December'
                }
            })

            const result = Object.values(dataConf.reduce((r, e) => {
                let k = `${e.month}|${e.month}`;
                if (!r[k]) r[k] = {...e, count: 1 }
                else r[k].count += 1;
                return r;
            }, {}))
            res.status(200).send({ data: result })
        } else if (decoded.Role == 'Distributor') {
            const confirmation = await Confirmation.find(find, { createdAt: 1 }).populate({
                path: 'patient',

                populate: {
                    path: 'user',
                    match: { distributor: { $in: decoded.id } }
                }


            }).lean()
            const confirmationHospital = await ConfirmationHospital.find(find, { createdAt: 1 }).populate({
                path: 'patient',

                populate: {
                    path: 'associatedhospital.id',
                    model: HospitalUser,
                    match: { distributor: { $in: decoded.id } }
                }
            }).lean()

            const dataFilterConfPatient = confirmation.filter(data => data.patient != null);
            const dataFilterConf = dataFilterConfPatient.filter(data => data.patient.user != null);

            const dataFilterConfHospitalPatient = confirmationHospital.filter(data => data.patient != null);
            const dataFilterConfHospital = dataFilterConfHospitalPatient.filter(data => data.patient.associatedhospital.id != null);

            const data = dataFilterConf.concat(dataFilterConfHospital)
            data.map(obj => {
                obj['createdAt'] = obj.createdAt.getMonth() + 1
            })
            data.map(obj => {
                if (obj.createdAt == '01') {
                    obj['month'] = 'January'
                } else if (obj.createdAt == '02') {
                    obj['month'] = 'February'
                } else if (obj.createdAt == '03') {
                    obj['month'] = 'March'
                } else if (obj.createdAt == '04') {
                    obj['month'] = 'April'
                } else if (obj.createdAt == '05') {
                    obj['month'] = 'May'
                } else if (obj.createdAt == '06') {
                    obj['month'] = 'June'
                } else if (obj.createdAt == '07') {
                    obj['month'] = 'July'
                } else if (obj.createdAt == '08') {
                    obj['month'] = 'August'
                } else if (obj.createdAt == '09') {
                    obj['month'] = 'September'
                } else if (obj.createdAt == '10') {
                    obj['month'] = 'October'
                } else if (obj.createdAt == '11') {
                    obj['month'] = 'November'
                } else if (obj.createdAt == '12') {
                    obj['month'] = 'December'
                }
            })

            const result = Object.values(data.reduce((r, e) => {
                let k = `${e.month}|${e.month}`;
                if (!r[k]) r[k] = {...e, count: 1 }
                else r[k].count += 1;
                return r;
            }, {}))
            res.status(200).send({ data: result })
        }
    } catch (err) {
        next(err)
    }

}