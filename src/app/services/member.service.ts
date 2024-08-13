import { Injectable, OnDestroy } from '@angular/core';
import { Member } from '../models/members';
import { IMember, IMemberOption } from '../interfaces/member';
import { UtilService } from './util.service';
import { BehaviorSubject, Subject, take, takeUntil } from 'rxjs';
import { IVersion } from '../interfaces/version';
import { IMemberStorage } from '../interfaces/member-storage';
import { ServiceBase } from '../base/service-base';
import { IndexedDBManager } from '../storage/indexedDB.manager';
import { Tables } from '../constants/constant';
import { DisplayService } from './display.service';

@Injectable({
  providedIn: 'root'
})
export class MemberService extends ServiceBase implements OnDestroy {

  membersLocalStorageKey = 'members';
  memberBookName = 'MyBook';
  version: IVersion = {
    primary: 0,
    major: 0,
    minor: 1,
  };
  members = new BehaviorSubject<Member[]>([]);

  public selectedMember?: Member;
  memberBookDetail = new Subject<IMemberStorage>();
  memberStorageManager = new IndexedDBManager<IMember>(Tables.MemberStorage, 'id');

  constructor(private utilService: UtilService, private displayService: DisplayService) {
    super();
    this.memberBookDetail
      .pipe(takeUntil(this.isServiceActive))
      .subscribe({
        next: memberStorage => this.saveMembersToLocalStorage(memberStorage)
      });
    this.members
      .pipe(takeUntil(this.isServiceActive))
      .subscribe({
        next: members => this.fireMemberStorageUpdate()
      });

    this.displayService.dialogOpened
      .pipe(takeUntil(this.isServiceActive))
      .subscribe({
        next: () => this.resetSelectedRecord()
      });
    this.loadSavedMembersFromStorage();


    // Code to delete layers from Indexed DB
    // setTimeout(() => {
    //   this.members.value.forEach(member => {
    //     member.options.forEach((option: any) => {
    //       option.type = DefaultOptionType;
    //     });
    //     this.memberStorageManager.update(member);
    //   })
    // }, 1000);
  }

  get versionNoString(): string {
    const defaultPad = (val: number) => val.toString().padStart(2, '0');
    return defaultPad(this.version.primary) + ':' + defaultPad(this.version.major) + ':' + defaultPad(this.version.minor);
  }

  set versionNoString(val: string) {
    const versionParts = val.toString().split(':');
    this.version.primary = +versionParts[0];
    this.version.major = +versionParts[1];
    this.version.minor = +versionParts[2];
  }

  ngOnDestroy(): void {
    this.onDestroy();
  }

  loadSavedMembersFromStorage(): void {

    const savedMemberBook = localStorage.getItem(this.membersLocalStorageKey);
    if (savedMemberBook) {
      const storedMemberBook: IMemberStorage = JSON.parse(savedMemberBook);
      this.versionNoString = storedMemberBook.version;
      this.memberBookName = storedMemberBook.name;
    }

    this.memberStorageManager.getAll()
      .pipe(take(1))
      .subscribe({
        next: members => {
          this.members.next(members.map(m => new Member(m)));
        }
      })
  }

  saveMembersToLocalStorage(members: IMemberStorage): void {
    localStorage.setItem(this.membersLocalStorageKey, JSON.stringify(members));
  }

  fireMemberStorageUpdate(): void {
    setTimeout(() => {
      this.memberBookDetail.next({
        name: this.memberBookName,
        version: this.versionNoString
      });
    }, 10);
  }

  updateBookName(name: string): void {
    this.memberBookName = name;
    this.fireMemberStorageUpdate();
  }

  updateVersionNumber(version: IVersion): void {
    this.version = version;
    this.fireMemberStorageUpdate();
  }

  addNewMember(member: IMember): void {
    member.id = this.utilService.generateNewId();
    if (member.options.length > 0) member.options = this.generateOptionIds(member.options);

    const members = this.members.value;
    members.push(new Member(member));
    this.memberStorageManager.add(member)
    this.members.next(members);
  }

  removeMember(id: string): void {
    const filteredMembers = this.members.value.filter(member => member.id !== id);
    this.members.next(filteredMembers);
    this.memberStorageManager.delete(id);
  }

  updateMember(memberData: IMember): void {
    const members = this.members.value;
    let member = members.find(member => member.id === memberData.id);
    if (!member) {
      console.log('No member found to update for ', memberData);
      return;
    }

    if (memberData.options.length > 0) memberData.options = this.generateOptionIds(memberData.options);
    member.updateDetails(memberData);
    this.members.next(members);
    this.memberStorageManager.update(memberData);
  }

  generateOptionIds(options: IMemberOption[]): IMemberOption[] {
    return options.map(option => {
      if (!option.optionId) option.optionId = this.utilService.generateNewId();
      return option
    });
  }

  addMemberOption(id: string, option: IMemberOption): void {
    const members = this.members.value;
    const member = members.find(member => member.id === id);
    if (!member) {
      console.log('No member found to add option for ', id);
      return;
    }

    member.addOption(option);
    this.members.next(members);
    this.memberStorageManager.update(member);
  }

  updateMemberOption(id: string, option: IMemberOption): void {
    const members = this.members.value;
    const member = members.find(member => member.id === id);
    if (!member) {
      console.log('No member found to update option for ', id);
      return;
    }

    member.updateOption(option);
    this.members.next(members);
    this.memberStorageManager.update(member);
  }

  removeMemberOption(id: string, optionId: string): void {
    const members = this.members.value;
    const member = members.find(member => member.id === id);
    if (!member) {
      console.log('No member found to update option for ', id);
      return;
    }

    member.removeOption(optionId);
    this.members.next(members);
    this.memberStorageManager.update(member);
  }

  resetSelectedRecord(): void {
    this.selectedMember = undefined;
  }

  selectRecord(record: Member): void {
    this.selectedMember = record;
  }
}
