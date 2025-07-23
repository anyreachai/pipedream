import common from "../common/common-calendar.mjs";

export default {
    ...common,
    key: "highlevel_oauth-get-calendar-free-slots",
    name: "Get Free Slots",
    description: "Retrieves available time slots from a calendar [See the documentation](https://highlevel.stoplight.io/docs/integrations/7f694ee8bd969-get-free-slots)",
    version: "0.0.2",
    type: "action",
    props: {
        ...common.props,        
        startDate: {
            type: "string",
            label: "Start Date",
            description: "The start date for slot lookup in YYYY-MM-DD format (e.g., 2024-01-15)",
        },
        endDate: {
            type: "string",
            label: "End Date",
            description: "The end date for slot lookup in YYYY-MM-DD format (e.g., 2024-01-16)",
        },
        userId: {
            type: "string",
            label: "User ID",
            description: "The user for whom the free slots are returned",
            optional: true,
            async options() {

                const users = await this.app._makeRequest({
                    url: "/users/",
                    params: {
                        locationId: this.app.getLocationId(),
                    },
                });
                return users?.users?.map(({
                    id: value, name: label,
                }) => ({
                    label,
                    value,
                })) || [];
            },

        },
        userIds: {
            type: "string[]",
            label: "User IDs",
            description: "The users for whom the free slots are returned",
            optional: true,
            async options() {
                const users = await this.app._makeRequest({
                    url: "/users/",
                    params: {
                        locationId: this.app.getLocationId(),
                    },
                });
                return users?.users?.map(({
                    id: value, name: label,
                }) => ({
                    label,
                    value,
                })) || [];
            }
        },
        timezone: {
            type: "string",
            label: "Timezone",
            description: "Timezone for the slots",
            optional: true,
            default: "America/New_York",
            options: [
                "America/New_York",
                "America/Chicago",
                "America/Denver",
                "America/Los_Angeles",
                "America/Phoenix",
                "America/Anchorage",
                "Pacific/Honolulu",
                "Europe/London",
                "Europe/Paris",
                "Europe/Berlin",
                "Europe/Rome",
                "Europe/Madrid",
                "Asia/Tokyo",
                "Asia/Shanghai",
                "Asia/Kolkata",
                "Asia/Dubai",
                "Australia/Sydney",
                "Australia/Melbourne",
                "UTC",
            ],
        },
    },
    async run({ $ }) {
        const {
            app,
            calendarId,
            startDate,
            endDate,
            timezone,
            userId,
        } = this;
        const args = {
            startDate: startDate ? new Date(startDate).getTime() : undefined,
            endDate: endDate ? new Date(endDate).getTime() : undefined,
            ...(timezone && { timezone }),
            ...(userId && { userId }),
        };

        const response = await app.getFreeSlots({
            $,
            calendarId,
            params: args,
        });

        let slotsCount = 0;
        for (const date of Object.keys(response)) {
            const slots = response[date].slots
            if (slots) {
                slotsCount += slots.length;
            }
        }
        $.export("$summary", `Successfully retrieved ${slotsCount} free slots from calendar ${calendarId}`);

        return response;
    },
};
