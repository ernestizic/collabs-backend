import { Test, TestingModule } from '@nestjs/testing';
import { PusherController } from './pusher.controller';

describe('PusherController', () => {
  let controller: PusherController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PusherController],
    }).compile();

    controller = module.get<PusherController>(PusherController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
