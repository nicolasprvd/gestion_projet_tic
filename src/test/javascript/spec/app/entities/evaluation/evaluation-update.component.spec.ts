import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';

import { ProjetticTestModule } from '../../../test.module';
import { EvaluationUpdateComponent } from 'app/entities/evaluation/evaluation-update.component';
import { EvaluationService } from 'app/entities/evaluation/evaluation.service';
import { Evaluation } from 'app/shared/model/evaluation.model';

describe('Component Tests', () => {
  describe('Evaluation Management Update Component', () => {
    let comp: EvaluationUpdateComponent;
    let fixture: ComponentFixture<EvaluationUpdateComponent>;
    let service: EvaluationService;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [ProjetticTestModule],
        declarations: [EvaluationUpdateComponent],
        providers: [FormBuilder]
      })
        .overrideTemplate(EvaluationUpdateComponent, '')
        .compileComponents();

      fixture = TestBed.createComponent(EvaluationUpdateComponent);
      comp = fixture.componentInstance;
      service = fixture.debugElement.injector.get(EvaluationService);
    });

    describe('save', () => {
      it('Should call update service on save for existing entity', fakeAsync(() => {
        // GIVEN
        const entity = new Evaluation(123);
        spyOn(service, 'update').and.returnValue(of(new HttpResponse({ body: entity })));
        comp.updateForm(entity);
        // WHEN
        comp.save();
        tick(); // simulate async

        // THEN
        expect(service.update).toHaveBeenCalledWith(entity);
        expect(comp.isSaving).toEqual(false);
      }));

      it('Should call create service on save for new entity', fakeAsync(() => {
        // GIVEN
        const entity = new Evaluation();
        spyOn(service, 'create').and.returnValue(of(new HttpResponse({ body: entity })));
        comp.updateForm(entity);
        // WHEN
        comp.save();
        tick(); // simulate async

        // THEN
        expect(service.create).toHaveBeenCalledWith(entity);
        expect(comp.isSaving).toEqual(false);
      }));
    });
  });
});
