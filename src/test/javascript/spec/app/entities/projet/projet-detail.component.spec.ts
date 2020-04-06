import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { JhiDataUtils } from 'ng-jhipster';

import { ProjetticTestModule } from '../../../test.module';
import { ProjetDetailComponent } from 'app/entities/projet/projet-detail.component';
import { Projet } from 'app/shared/model/projet.model';

describe('Component Tests', () => {
  describe('Projet Management Detail Component', () => {
    let comp: ProjetDetailComponent;
    let fixture: ComponentFixture<ProjetDetailComponent>;
    let dataUtils: JhiDataUtils;
    const route = ({ data: of({ projet: new Projet(123) }) } as any) as ActivatedRoute;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [ProjetticTestModule],
        declarations: [ProjetDetailComponent],
        providers: [{ provide: ActivatedRoute, useValue: route }]
      })
        .overrideTemplate(ProjetDetailComponent, '')
        .compileComponents();
      fixture = TestBed.createComponent(ProjetDetailComponent);
      comp = fixture.componentInstance;
      dataUtils = fixture.debugElement.injector.get(JhiDataUtils);
    });

    describe('OnInit', () => {
      it('Should load projet on init', () => {
        // WHEN
        comp.ngOnInit();

        // THEN
        expect(comp.projet).toEqual(jasmine.objectContaining({ id: 123 }));
      });
    });

    describe('byteSize', () => {
      it('Should call byteSize from JhiDataUtils', () => {
        // GIVEN
        spyOn(dataUtils, 'byteSize');
        const fakeBase64 = 'fake base64';

        // WHEN
        comp.byteSize(fakeBase64);

        // THEN
        expect(dataUtils.byteSize).toBeCalledWith(fakeBase64);
      });
    });

    describe('openFile', () => {
      it('Should call openFile from JhiDataUtils', () => {
        // GIVEN
        spyOn(dataUtils, 'openFile');
        const fakeContentType = 'fake content type';
        const fakeBase64 = 'fake base64';

        // WHEN
        comp.openFile(fakeContentType, fakeBase64);

        // THEN
        expect(dataUtils.openFile).toBeCalledWith(fakeContentType, fakeBase64);
      });
    });
  });
});
