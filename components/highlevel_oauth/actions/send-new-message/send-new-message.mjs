import common from "../../common/base.mjs";

export default {
    ...common,
    key: "highlevel_oauth-send-new-message",
    name: "Send New Message",
    description: "Sends a new message to a contact on HighLevel. [See the documentation](https://highlevel.stoplight.io/docs/integrations/4c8362223c17b-create-contact)",
    version: "0.0.1",
    type: "action",
    props: {
        ...common.props,
        type: {
            type: "string",
            label: "Type",
            description: "Type of message being sent",
            options: ["SMS", "Email", "WhatsApp", "IG", "FB", "Custom", "Live_Chat"],
            reloadProps: true,
        },
        contactId: {
            type: "string",
            label: "Contact ID",
            description: "ID of the contact receiving the message",
            reloadProps: true,
            async options() {
                const { contacts } = await this.app._makeRequest({
                    url: "/contacts/",
                    params: {
                        locationId: this.app.getLocationId(),
                    },
                });
                return contacts?.map(({
                    id, email,
                }) => ({
                    label: email,
                    value: id.toString(),
                })) || [];
            },
        },
        attachments: {
            type: "string[]",
            label: "Attachments",
            description: "Array of attachment URLs",
            optional: true,
        },
        replyMessageId: {
            type: "string",
            label: "Reply Message ID",
            description: "ID of the message being replied to",
            optional: true,
        },
        scheduledTimestamp: {
            type: "integer",
            label: "Scheduled Timestamp",
            description: "UTC Timestamp (in seconds) at which the message should be scheduled",
            optional: true,
        },
        conversationProviderId: {
            type: "string",
            label: "ID of conversation provider",
            optional: true
        }
    },
    async additionalProps() {
        const props = {}
        if (this.type === "Email") {
            props.emailFrom = {
                type: "string",
                label: "Email From",
                description: "Email address to send from",
            }
            props.subject = {
                type: "string",
                label: "Subject",
                description: "Subject line for email messages",
            }
            props.html = {
                type: "string",
                label: "HTML Content",
                description: "HTML content of the message",
            }
            props.emailTo = {
                type: "string",
                label: "Email To",
                description: "Email address to send to, if different from contact's primary email. This should be a valid email address associated with the contact.",
                optional: true,
            }

            props.emailReplyMode = {
                type: "string",
                label: "Email Reply Mode",
                description: "Mode for email replies",
                options: ["reply", "reply_all"],
                optional: true,
            }
            props.threadId = {
                type: "string",
                label: "Thread ID",
                description: "ID of message thread. For email messages, this is the message ID that contains multiple email messages in the thread",
                optional: true,
            }

            props.emailCc = {
                type: "string[]",
                label: "Email CC",
                description: "Array of CC email addresses",
                optional: true,
            }
            props.emailBcc = {
                type: "string[]",
                label: "Email BCC",
                description: "Array of BCC email addresses",
                optional: true,
            }
        }
        if (this.type !== "Email") {
            props.message = {
                type: "string",
                label: "Message Content",
                description: "Text content of the message",
            }
        }
        if (this.type === "SMS" || this.type === "WhatsApp") {
            props.fromNumber = {
                type: "string",
                label: "From Number",
                description: "Phone number used as the sender number for outbound messages",
            }
            props.toNumber = {
                type: "string",
                label: "To Number",
                description: "Recipient phone number for outbound messages",
            }
        }
        if (this.contactId) {
            const { events } = await this.app._makeRequest({
                url: `/contacts/${this.contactId}/appointments`,
                params: {
                    contactId: this.contactId,
                },
            });
            const options = events?.map(({
                id, title,
            }) => ({
                label: title,
                value: id.toString(),
            })) || [];
            props.appointmentId = {
                type: "string",
                label: "Appointment ID",
                description: "ID of the associated appointment",
                optional: true,
                options,
            }
        }
        if (this.type === "Email" || this.type === "SMS" || this.type === "WhatsApp") {
            const typeMapping = {
                Email: "email",
                SMS: "sms",
                WhatsApp: "whatsapp",
            }
            const { templates } = await this.app._makeRequest({
                url: `/locations/${this.app.getLocationId()}/templates`,
                params: {
                    originId: this.app.getLocationId(),
                    type: typeMapping[this.type],
                },
            });
            const options = templates?.map(({
                id, name,
            }) => ({
                label: name,
                value: id.toString(),
            })) || [];
            props.templateId = {
                type: "string",
                label: "Template ID",
                description: "ID of message template",
                optional: true,
                options,
            }
        }
        return props
    },
    async run({ $ }) {
        const { app, ...data } = this;
        const response = await this.app.sendNewMessage({
            $,
            data,
        });

        $.export("$summary", `Successfully sent message (messageId: ${response?.messageId})`);
        return response;
    },
};
