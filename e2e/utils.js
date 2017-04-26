export const sendTestMessage = async ({ email, subject }) => {
  const request = sendgrid.emptyRequest({
    method: 'POST',
    path: '/v3/mail/send',
    body: {
      personalizations: [{
        to: [{ email }],
        subject,
      }],
      from: {
        email: 'sendgrid-test@rebay.io',
      },
      content: [
        {
          type: 'text/html',
          value: 'find one message by subject',
        },
      ],
    },
  });

  return sendgrid.API(request);
};
