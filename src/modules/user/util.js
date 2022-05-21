const nodemailer = require("nodemailer");
const { generateError } = require("../../utils/error");

const sendMail = async (otp, email, token, domain) => {
  const transporter = await nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS, // naturally, replace both with your real credentials or an application-specific password
    },
  });

  let mailOptions = {
    from: "support@padboat.com",
    to: `${email}`,
    subject: "OTP for SignUp verification with PaddleBoat",
    html: `Welcome!
    <br/>
    <br/>
    We're excited to get you started! First, let’s verify your account. Here is your OTP for verification: ${otp}
    <br/><br/>
    Reach out to the system admin in case you face any difficulties. 
    <br/>
    <br/>
    Thanks,<br/>
    Team PaddleBoat`,
  };

  mailOptions =
    otp == 0
      ? {
          from: "support@padboat.com",
          to: `${email}`,
          subject: "Reset Password for PaddleBoat",
          html: `Hi there!<br/><br/>

          We noticed you wanted to reset your password for PaddleBoat. 
          Head over to this <a href=${
            "https://www." +
            domain +
            ".padboat.com/reset-password/?token=" +
            token
          }>link</a>  to quickly set up a new one!
          <br/><br/>
          Thanks,<br/>
          Team PaddleBoat`,
        }
      : mailOptions;
  console.log({ mailOptions, otp, email, token });
  await transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      generateError("message not sent ", error);
    } else {
      console.log("Email sent: " + info.response);
      return { message: "message  sent succesfuly" };
    }
  });
};

const createDynamicQueryPagination = (
  search,
  filterCreator,
  filterInactive,
  organization
) => {
  // Ensure query happens within organization
  let dynamicQuery = {
    $and: [
      {
        organization: organization,
      },
    ],
  };
  // Dynamically build query based on parameters
  if (search || filterCreator || filterInactive) {
    if (search) {
      const searchQuery = {
        $or: [
          {
            $and: [
              {
                employeeId: { $regex: search + ".*", $options: "i" },
              },
              { organization: organization },
            ],
          },
          {
            $and: [
              { name: { $regex: search + ".*", $options: "i" } },
              { organization: organization },
            ],
          },
        ],
      };
      dynamicQuery.$and.push(searchQuery);
    }
    if (filterCreator) {
      const filterCreatorQuery = {
        $and: [{ role: "creator" }, { organization: organization }],
      };
      dynamicQuery.$and.push(filterCreatorQuery);
    }
    // Enable once activeStatus is enabled in User Schema
    // if (filterInactive) {
    //   const filterInactiveQuery = {
    //     $and: [
    //       {
    //         activeStatus: false,
    //       },
    //       { organization: organization },
    //     ],
    //   };
    //   dynamicQuery.$and.push(filterInactiveQuery);
    // }
  }
  return dynamicQuery;
};

const processPaginatedResults = (data) => {
  // $facet always returns array
  // Add Active Status once implemented
  let processedData = {
    totalCount: data[0].totalCount[0].totalCount,
    data: data[0].data.map((user) => {
      return {
        employeeId: user.emplpyeeId,
        name: user.name,
        role: user.role,
        email: user.email,
        phoneNumber: user.phoneNumber,
        employeeData: user.employeeData,
        // accessStatus: user.accessStatus
      };
    }),
  };
  return processedData;
};

module.exports = {
  sendMail,
  createDynamicQueryPagination,
  processPaginatedResults,
};
