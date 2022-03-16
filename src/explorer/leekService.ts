import { LeekTreeItem } from '../shared/leekTreeItem';

export abstract class LeekService {
  public showLabel: boolean = true;

  public toggleLabel(): void {
    this.showLabel = !this.showLabel;
  }

  abstract getData(code: Array<string>, order: number, group: string): Promise<Array<LeekTreeItem>>;
}
