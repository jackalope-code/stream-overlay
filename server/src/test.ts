import Yup, { number, object, boolean, string, mixed } from "yup";

const requiredNonNegativeInt = number().required().integer().min(0, '');

const videoUpdatePartial = object({
  startTime: requiredNonNegativeInt,
  playing: boolean().required(),
  loop: boolean().required(),
}).required();

const videoUpdateSchema = object({
  id: number().required().positive(),
  videoData: videoUpdatePartial,
})

const positionUpdateSchema = object({
  id: number().required().positive(),
  type: string().required().oneOf(['image', 'video']),
  event: string().required().oneOf(['update', 'add']),
  x: requiredNonNegativeInt,
  y: requiredNonNegativeInt,
  width: number().required().positive(),
  height: number().required().positive(),
});

const fullVideoUpdateSchema = videoUpdateSchema.concat(...positionUpdateSchema).concat({
  type: string().required().oneOf(['video']),
  event: string().required().oneOf(['update'])
});

const imageUpdateSchema = positionUpdateSchema.concat({
  type: string().required.oneOf(['image']),
  event: string().required().oneOf(['update'])
})


// otherwise: object().notRequired(),
// const messageAddSchema = imageUpdateSchema.concat(
//   object().shape({
//     // TODO: restrict to youtube for videos
//    url: string().required(),
//    event: string().required().oneOf(['add']),
//    type: string().required().oneOf(['image', 'video']),
//   //  should check type and require based on that
//    videoData: mixed().required().when('type', ([type]: string[], schema) => {
//     if(type === 'video') {
//       return schema.concat(videoUpdatePartial).required();
//     }
//     console.log("TYPE: " + type)
//     // return null;
//     return schema.nullable().notRequired();
//   }),
// }))

const messageAddSchema = imageUpdateSchema.concat(
  object().shape({
    // TODO: restrict to youtube for videos
   url: string().required(),
   event: string().required().oneOf(['add']),
   type: string().required().oneOf(['image', 'video']),
  //  should check type and require based on that
  })
)

const videoAddSchema = messageAddSchema.concat(
  object({
    videoData: videoUpdatePartial.required(),
    type: string().required().oneOf(['video'])
  })
)

const imageAddSceham = messageAddSchema.concat(
  object({
    type: string().required().oneOf(['image'])
  })
)

// TODO
const messageEditorChangeSchema = object({

});

async function testMovementUpdate() {
  console.log("movement update");
  const testUpdate = {
    id: 1,
    event: 'update',
    x: 0,
    y: 0,
    width: 1,
    height: 1,
  }
  const value = await imageUpdateSchema.validate(testUpdate);
  console.log(value);
}

async function testAddImage() {
  console.log('add image');
  const imageData = {
    url: 'malformed url',
    id: 1,
    event: 'add',
    x: 0,
    y: 0,
    width: 1,
    height: 1,
    type: 'image'
  }
  const value = await messageAddSchema.validate(imageData);
  console.log(value);
}

async function testVideoStateUpdate() {
  console.log('update video data');
  const videoData = {

  }

}

// TODO: TEST FAILS... IMAGE SHOULD NOT HAVE VIDEO DATA
async function testAddMessageErrorTypeMismatchVideoData() {
  console.log('running testAddMessageErrorTypeMismatchVideoData')
  const videoData = {
    url: 'malformed url',
    id: 1,
    event: 'add',
    x: 0,
    y: 0,
    width: 1,
    height: 1,
    type: 'image',
    videoData: {
      startTime: 0,
      playing: false,
      loop: false,
    }
  }
  const hasPassed = await videoAddSchema.isValid(videoData);
  console.log("PASSED")
  // TODO: Target the ValidationError. This test should only return true when the error is the videoData, not from other message issues.
  // Test fails if validation succeeds.
  try {
    const value = await videoAddSchema.validate(videoData);
    console.log('Test failed. Message:');
    console.log(value);
    return false;
    // Expects a validation error from an invalid videoData field
  } catch(e) {
    console.log(e);
    return true;
  }

}

async function testVideoUpdate() {
  console.log('TODO: test video message updates');
}

async function test() {
  console.log("start tests");
  await testMovementUpdate();
  await testAddImage();
  let passedTest;
  try {
    passedTest = await testAddMessageErrorTypeMismatchVideoData();
  } catch(e) {}
  console.log("TEST RESULT: " + (passedTest ? 'PASSED' : 'FAILED'));
  // Promise.all([testMovementUpdate(), testAddImage(), testAddVideo()]);
  console.log("end tests");
}

test();