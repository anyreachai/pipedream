import common from "../../common/base.mjs";

export default {
    ...common,
    props: {
        ...common.props,
        calendarId: {
            type: "string",
            label: "Calendar ID",
            description: "The ID of the calendar",
            async options() {
                const calendars = await this.app._makeRequest({
                    url: "/calendars/",
                    params: {
                        locationId: this.app.getLocationId(),
                    },
                });
                return calendars?.calendars
                    ?.filter(calendar => calendar.isActive)
                    .map(({ id: value, name: label }) => ({
                        label,
                        value,
                    })) || [];
            },
        },
    }
};
