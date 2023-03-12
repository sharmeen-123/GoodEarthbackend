"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const cron = require("node-cron");
let shifttid = false;
// .................... to update location .........................
const updateData = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("in update.......");
    // try {
    //   const response = await axios.get('http://api.ipapi.com/api/check?access_key=9c326d6e83bb32f28397c00bc5025384');
    //   let location = response.data;
    //   console.log(`Location: ${location.latitude}`);
    //   let updatedLocation = {
    //     longitude: location.longitude,
    //     latitude: location.latitude
    //   }
    //   let updateLocation = await shifts.findOneAndUpdate(
    //     {_id : shifttid},
    //     {lastLocation: updatedLocation,
    //       $push : {
    //           locations : updatedLocation
    //         }}
    // )
    // } catch (error) {
    //   console.log(error.message);
    // }
});
cron.schedule('*/30 * * * * *', () => {
    console.log("cron running....... 1 2 3 4 5 6 ............");
    updateData();
    console.log("data updated!!!", shifttid);
}).start();
const shiftsController = {};
exports.default = shiftsController;
//# sourceMappingURL=cycle.controller.js.map