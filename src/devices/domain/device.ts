export enum DeviceStatus {
  ON = 'ON',
  OFF = 'OFF',
}

export class Device {
  constructor(
    public readonly id: string,
    public name: string,
    public status: DeviceStatus,
    public type: string,
    public value?: number,
    public unit?: string,
  ) {}

  // 도메인 로직: 예를 들어 전등은 켜기/끄기만 가능하고, 센서는 수치만 가진다는 등의 규칙을 넣을 수 있습니다.
  updateStatus(newStatus: DeviceStatus) {
    this.status = newStatus;
  }
}
