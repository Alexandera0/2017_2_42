import eventBus, {EventsEnum, EventBus, ScopesEnum} from './modules/eventBus';
import router, {Router} from './modules/router';
import userService, {UserService} from './services/userService';

/**
 * Class implements multiplayer logic of application
 *
 * @class Multiplayer
 * @implements {App}
 */
export default class Online implements Application.App {
  private rootNode: HTMLElement;
  private router: Router;
  private bus: EventBus;
  private userService: UserService;
  private urlRoot: string;

  /**
   * Creates an instance of Multiplayer.
   * @param {HTMLElement} parentNode root element for views
   * @memberof Multiplayer
   */
  constructor(parentNode: HTMLElement) {
    this.rootNode = parentNode;
    this.router = router;
    this.bus = eventBus;
    this.userService = userService;
    this.urlRoot = '/online';

    this.bus.on(ScopesEnum.auth, EventsEnum.user_signed_up, () => {
      // todo First visit advices
      router.go(`${this.urlRoot}/lobby`);
    });

    this.bus.on(ScopesEnum.auth, EventsEnum.user_signed_up, () => {
      router.go(`${this.urlRoot}/lobby`);
    });
  }

  start(): void {
    console.log(this.userService.getUser());
    if (this.userService.getUser()) {
      return this.bus.emit(ScopesEnum.auth, EventsEnum.user_logged_in);
    }
    return router.go(`${this.urlRoot}/login`);
  }

  stop() {

  }

  pause() {

  }

  resume() {

  }
}
