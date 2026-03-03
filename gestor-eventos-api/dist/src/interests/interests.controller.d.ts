import { InterestsService } from "./interests.service";
import { ToggleInterestDto } from "./dto";
export declare class InterestsController {
    private service;
    constructor(service: InterestsService);
    toggle(dto: ToggleInterestDto): Promise<{
        interested: boolean;
        interestCount: any;
    }>;
    reportTop(): Promise<any>;
}
