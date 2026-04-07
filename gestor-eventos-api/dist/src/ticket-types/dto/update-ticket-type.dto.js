"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTicketTypeDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_ticket_type_dto_1 = require("./create-ticket-type.dto");
class UpdateTicketTypeDto extends (0, mapped_types_1.PartialType)(create_ticket_type_dto_1.CreateTicketTypeDto) {
}
exports.UpdateTicketTypeDto = UpdateTicketTypeDto;
//# sourceMappingURL=update-ticket-type.dto.js.map